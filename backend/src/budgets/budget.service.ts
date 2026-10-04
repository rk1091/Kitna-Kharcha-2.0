import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BudgetPeriod } from '@prisma/client';

export interface CreateBudgetDto {
  categoryId: string;
  amount: number;
  period?: BudgetPeriod;
  currency?: string;
}

export interface UpdateBudgetDto {
  amount?: number;
  isActive?: boolean;
}

export interface BudgetStatusItem {
  id: string;
  categoryId: string;
  categoryName: string;
  limit: number;
  currentSpend: number;
  remaining: number;
  percentageConsumed: number;
  projectedSpend: number;
  isOverBudget: boolean;
  isWarning: boolean;
  isActive: boolean;
  period: BudgetPeriod;
}

@Injectable()
export class BudgetService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all budgets with live spend calculations and progress metrics.
   */
  async getBudgets(userId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      orderBy: { amount: 'desc' },
    });

    const categories = await this.prisma.category.findMany();
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const daysInMonth = endOfMonth.getDate();
    const currentDay = Math.max(1, now.getDate());

    const items: BudgetStatusItem[] = [];
    let totalBudget = 0;
    let totalSpend = 0;

    for (const b of budgets) {
      const limit = Number(b.amount);
      if (b.isActive) totalBudget += limit;

      // Find current month debit transactions in this category
      const txns = await this.prisma.transaction.findMany({
        where: {
          statement: { userId },
          categoryId: b.categoryId,
          direction: 'DEBIT',
          isDuplicate: false,
          txnDate: { gte: startOfMonth, lte: endOfMonth },
        },
      });

      const currentSpend = txns.reduce((sum, t) => sum + Math.abs(Number(t.amountSigned)), 0);
      if (b.isActive) totalSpend += currentSpend;

      const percentage = limit > 0 ? Math.round((currentSpend / limit) * 100) : 0;
      const remaining = Math.max(0, limit - currentSpend);
      const isOverBudget = currentSpend > limit;
      const isWarning = percentage >= 80 && !isOverBudget;
      const projectedSpend = Math.round((currentSpend / currentDay) * daysInMonth);

      items.push({
        id: b.id,
        categoryId: b.categoryId,
        categoryName: categoryMap.get(b.categoryId) || 'Uncategorized',
        limit,
        currentSpend: Math.round(currentSpend * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        percentageConsumed: percentage,
        projectedSpend,
        isOverBudget,
        isWarning,
        isActive: b.isActive,
        period: b.period,
      });
    }

    const overallPercentage = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0;

    return {
      budgets: items,
      summary: {
        totalBudget: Math.round(totalBudget * 100) / 100,
        totalSpend: Math.round(totalSpend * 100) / 100,
        remainingBudget: Math.max(0, totalBudget - totalSpend),
        overallPercentageConsumed: overallPercentage,
        overBudgetCount: items.filter(i => i.isOverBudget && i.isActive).length,
        warningCount: items.filter(i => i.isWarning && i.isActive).length,
      },
    };
  }

  /**
   * Create or update a budget limit for a category.
   */
  async createBudget(userId: string, dto: CreateBudgetDto) {
    const period = dto.period || BudgetPeriod.MONTHLY;

    return this.prisma.budget.upsert({
      where: {
        userId_categoryId_period: {
          userId,
          categoryId: dto.categoryId,
          period,
        },
      },
      create: {
        userId,
        categoryId: dto.categoryId,
        amount: dto.amount,
        period,
        currency: dto.currency || 'INR',
        isActive: true,
      },
      update: {
        amount: dto.amount,
        isActive: true,
      },
    });
  }

  /**
   * Update an existing budget.
   */
  async updateBudget(userId: string, id: string, dto: UpdateBudgetDto) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    return this.prisma.budget.update({
      where: { id },
      data: {
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  /**
   * Delete a budget.
   */
  async deleteBudget(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    return this.prisma.budget.delete({
      where: { id },
    });
  }

  /**
   * Fast status summary for dashboard and alert widgets.
   */
  async getBudgetStatus(userId: string) {
    const result = await this.getBudgets(userId);
    const criticalAlerts = result.budgets.filter(b => b.isActive && (b.isOverBudget || b.isWarning));

    return {
      summary: result.summary,
      alerts: criticalAlerts.map(b => ({
        categoryId: b.categoryId,
        categoryName: b.categoryName,
        type: b.isOverBudget ? 'EXCEEDED' : 'WARNING',
        message: b.isOverBudget
          ? `Budget exceeded for ${b.categoryName}: ₹${b.currentSpend} of ₹${b.limit} (${b.percentageConsumed}%)`
          : `Budget warning for ${b.categoryName}: ${b.percentageConsumed}% consumed (₹${b.currentSpend} of ₹${b.limit})`,
        percentage: b.percentageConsumed,
      })),
    };
  }
}
