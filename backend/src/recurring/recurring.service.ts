import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecurringFreq, RecurringType } from '@prisma/client';

export interface DetectedRecurringCandidate {
  merchantName: string;
  type: RecurringType;
  frequency: RecurringFreq;
  avgAmount: number;
  lastSeenDate: Date;
  confidence: number;
  transactionIds: string[];
  categoryId?: string;
}

@Injectable()
export class RecurringService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Scan user's debit transactions to detect and persist recurring subscriptions, utilities, and EMIs.
   */
  async detectRecurring(userId: string): Promise<any> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        statement: { userId },
        isDuplicate: false,
        direction: 'DEBIT',
      },
      include: {
        category: true,
      },
      orderBy: { txnDate: 'asc' },
    });

    // Group by normalized description / merchant
    const groupsMap = new Map<string, typeof transactions>();
    for (const txn of transactions) {
      const key = (txn.normalizedDescription || txn.description || 'Unknown').trim().toLowerCase();
      if (!groupsMap.has(key)) {
        groupsMap.set(key, []);
      }
      groupsMap.get(key)!.push(txn);
    }

    const candidates: DetectedRecurringCandidate[] = [];

    for (const [key, txns] of groupsMap.entries()) {
      if (txns.length < 2) continue;

      // Sort chronological
      txns.sort((a, b) => a.txnDate.getTime() - b.txnDate.getTime());

      const amounts = txns.map(t => Number(t.debitAmount || t.amountSigned));
      const dates = txns.map(t => t.txnDate.getTime());

      // Calculate intervals in days
      const intervals: number[] = [];
      for (let i = 1; i < dates.length; i++) {
        const diffDays = Math.round((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
        intervals.push(diffDays);
      }

      if (intervals.length === 0) continue;

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const frequency = this.detectFrequency(avgInterval);
      if (!frequency) continue;

      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const merchantName = txns[0].normalizedDescription || txns[0].description;
      const recurringType = this.classifyRecurringType(merchantName, txns[0].category?.name);

      const candidate: DetectedRecurringCandidate = {
        merchantName,
        type: recurringType,
        frequency,
        avgAmount: Math.round(avgAmount * 100) / 100,
        lastSeenDate: txns[txns.length - 1].txnDate,
        confidence: this.calculateConfidence(txns.length, intervals, amounts),
        transactionIds: txns.map(t => t.id),
        categoryId: txns[0].categoryId || undefined,
      };

      candidates.push(candidate);
    }

    // Persist or update RecurringGroup entities
    const savedGroups = [];
    for (const cand of candidates) {
      // Find existing group by merchantName or category
      let group = await this.prisma.recurringGroup.findFirst({
        where: {
          userId,
          merchantId: cand.merchantName,
        },
      });

      if (group) {
        group = await this.prisma.recurringGroup.update({
          where: { id: group.id },
          data: {
            avgAmount: cand.avgAmount,
            frequency: cand.frequency,
            type: cand.type,
            lastSeenDate: cand.lastSeenDate,
            categoryId: cand.categoryId,
          },
        });
      } else {
        group = await this.prisma.recurringGroup.create({
          data: {
            userId,
            merchantId: cand.merchantName,
            categoryId: cand.categoryId,
            type: cand.type,
            frequency: cand.frequency,
            avgAmount: cand.avgAmount,
            currency: 'INR',
            lastSeenDate: cand.lastSeenDate,
            isActive: true,
          },
        });
      }

      // Link transactions to recurring group
      await this.prisma.transaction.updateMany({
        where: { id: { in: cand.transactionIds } },
        data: { recurringGroupId: group.id },
      });

      savedGroups.push(group);
    }

    return this.getRecurring(userId);
  }

  /**
   * Fetch all recurring groups for the user with commitment summary.
   */
  async getRecurring(userId: string) {
    const groups = await this.prisma.recurringGroup.findMany({
      where: { userId },
      orderBy: { avgAmount: 'desc' },
    });

    let totalMonthlyCommitment = 0;
    let activeCount = 0;

    for (const group of groups) {
      if (!group.isActive) continue;
      activeCount++;

      const amount = Number(group.avgAmount);
      switch (group.frequency) {
        case RecurringFreq.WEEKLY:
          totalMonthlyCommitment += amount * 4.33;
          break;
        case RecurringFreq.MONTHLY:
          totalMonthlyCommitment += amount;
          break;
        case RecurringFreq.QUARTERLY:
          totalMonthlyCommitment += amount / 3;
          break;
        case RecurringFreq.ANNUAL:
          totalMonthlyCommitment += amount / 12;
          break;
      }
    }

    return {
      groups,
      summary: {
        totalMonthlyCommitment: Math.round(totalMonthlyCommitment * 100) / 100,
        activeCount,
        totalCount: groups.length,
      },
    };
  }

  /**
   * Toggle recurring group active status.
   */
  async toggleRecurring(userId: string, id: string) {
    const group = await this.prisma.recurringGroup.findFirst({
      where: { id, userId },
    });

    if (!group) {
      throw new NotFoundException('Recurring group not found');
    }

    return this.prisma.recurringGroup.update({
      where: { id },
      data: { isActive: !group.isActive },
    });
  }

  private detectFrequency(avgIntervalDays: number): RecurringFreq | null {
    if (avgIntervalDays >= 5 && avgIntervalDays <= 9) {
      return RecurringFreq.WEEKLY;
    }
    if (avgIntervalDays >= 25 && avgIntervalDays <= 35) {
      return RecurringFreq.MONTHLY;
    }
    if (avgIntervalDays >= 80 && avgIntervalDays <= 100) {
      return RecurringFreq.QUARTERLY;
    }
    if (avgIntervalDays >= 340 && avgIntervalDays <= 385) {
      return RecurringFreq.ANNUAL;
    }
    return null;
  }

  private classifyRecurringType(merchant: string, categoryName?: string): RecurringType {
    const m = merchant.toLowerCase();
    const c = (categoryName || '').toLowerCase();

    // 1. Subscription keywords
    const subKeywords = [
      'netflix', 'spotify', 'prime', 'youtube', 'hotstar', 'disney', 'apple', 'icloud',
      'google', 'chatgpt', 'openai', 'github', 'gym', 'cult', 'swiggy one', 'zomato gold',
      'adobe', 'notion', 'medium', 'linkedin', 'times prime', 'audible', 'hulu', 'patreon',
    ];
    if (subKeywords.some(k => m.includes(k))) {
      return RecurringType.SUBSCRIPTION;
    }

    // 2. Utility keywords
    const utilKeywords = [
      'bescom', 'electricity', 'broadband', 'airtel', 'jio', 'vi ', 'vodafone',
      'act corp', 'tatasky', 'dth', 'piped gas', 'indane', 'hpcl', 'water', 'utility',
    ];
    if (utilKeywords.some(k => m.includes(k)) || c.includes('utilit')) {
      return RecurringType.UTILITY;
    }

    // 3. EMI keywords
    const emiKeywords = [
      'bajaj', 'loan', 'emi', 'hdfc loan', 'sbi card emi', 'cred emi',
      'home loan', 'car loan', 'personal loan', 'finance',
    ];
    if (emiKeywords.some(k => m.includes(k))) {
      return RecurringType.EMI;
    }

    return RecurringType.REGULAR_EXPENSE;
  }

  private calculateConfidence(count: number, intervals: number[], amounts: number[]): number {
    let score = 0.7;

    // More occurrences = higher confidence
    if (count >= 4) score += 0.15;
    else if (count >= 3) score += 0.10;
    else if (count >= 2) score += 0.05;

    // Low amount variance = higher confidence
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);
    if (minAmount > 0 && (maxAmount - minAmount) / minAmount < 0.1) {
      score += 0.10;
    }

    return Math.min(score, 0.99);
  }
}
