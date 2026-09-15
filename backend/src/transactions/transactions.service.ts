import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Direction, Prisma } from '@prisma/client';

export interface TransactionFilters {
  statementId?: string;
  categoryId?: string;
  direction?: 'CREDIT' | 'DEBIT';
  search?: string;
  tag?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async getTransactions(userId: string, filters?: TransactionFilters) {
    const where: Prisma.TransactionWhereInput = {
      statement: { userId },
    };

    if (filters?.statementId) {
      where.statementId = filters.statementId;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.direction) {
      where.direction = filters.direction as Direction;
    }

    if (filters?.tag) {
      where.tags = { has: filters.tag };
    }

    if (filters?.startDate || filters?.endDate) {
      where.txnDate = {};
      if (filters.startDate) {
        where.txnDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.txnDate.lte = new Date(filters.endDate);
      }
    }

    if (filters?.search) {
      const s = filters.search.trim();
      where.OR = [
        { normalizedDescription: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
        { maskedDescription: { contains: s, mode: 'insensitive' } },
      ];
    }

    const take = filters?.limit ? Number(filters.limit) : 250;
    const skip = filters?.offset ? Number(filters.offset) : 0;

    return this.prisma.transaction.findMany({
      where,
      orderBy: { txnDate: 'desc' },
      take,
      skip,
      include: {
        category: true,
        merchant: true,
      },
    });
  }

  async getRecentTransactions(userId: string) {
    return this.getTransactions(userId, { limit: 100 });
  }

  async getStatementUploads(userId: string) {
    return this.prisma.statementUpload.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      take: 10,
    });
  }

  async updateTransaction(
    userId: string,
    id: string,
    data: {
      categoryId?: string;
      tags?: string[];
      normalizedDescription?: string;
      amountSigned?: number;
    },
  ) {
    const txn = await this.prisma.transaction.findFirst({
      where: { id, statement: { userId } },
      include: { statement: true },
    });

    if (!txn) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }

    const updateData: Prisma.TransactionUpdateInput = {};
    if (data.categoryId) updateData.category = { connect: { id: data.categoryId } };
    if (data.tags) updateData.tags = data.tags;
    if (data.normalizedDescription) updateData.normalizedDescription = data.normalizedDescription;
    if (data.amountSigned !== undefined) updateData.amountSigned = data.amountSigned;

    // Auto-Learning Engine: Create a smart rule when user overrides category
    if (data.categoryId && txn.categoryId !== data.categoryId) {
      updateData.classificationReason = 'MANUAL_OVERRIDE';
      updateData.isManualOverride = true;

      const existingRule = await this.prisma.classificationRule.findFirst({
        where: {
          userId,
          categoryId: data.categoryId,
          source: 'AI_LEARNED',
          name: `Auto-Learned: ${txn.normalizedDescription}`,
        },
      });

      if (!existingRule) {
        await this.prisma.classificationRule.create({
          data: {
            userId,
            name: `Auto-Learned: ${txn.normalizedDescription}`,
            categoryId: data.categoryId,
            conditions: {
              field: 'normalizedDescription',
              operator: 'equals',
              value: txn.normalizedDescription,
            },
            source: 'AI_LEARNED',
            priority: 100,
          },
        });
      }
    }

    return this.prisma.transaction.update({
      where: { id },
      data: updateData,
      include: { category: true, merchant: true },
    });
  }

  async deleteTransaction(userId: string, id: string) {
    const txn = await this.prisma.transaction.findFirst({
      where: { id, statement: { userId } },
    });

    if (!txn) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }

    await this.prisma.transaction.delete({
      where: { id },
    });

    return { success: true, deletedId: id };
  }

  async bulkCategorize(userId: string, transactionIds: string[], categoryId: string) {
    const result = await this.prisma.transaction.updateMany({
      where: {
        id: { in: transactionIds },
        statement: { userId },
      },
      data: {
        categoryId,
        classificationReason: 'MANUAL_OVERRIDE',
        isManualOverride: true,
      },
    });

    return { success: true, count: result.count };
  }

  async bulkDelete(userId: string, transactionIds: string[]) {
    const result = await this.prisma.transaction.deleteMany({
      where: {
        id: { in: transactionIds },
        statement: { userId },
      },
    });

    return { success: true, count: result.count };
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(data: { name: string; type?: 'EXPENSE' | 'INCOME' | 'NEUTRAL'; color?: string; icon?: string }) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        type: data.type || 'EXPENSE',
        color: data.color || '#6366F1',
        icon: data.icon || 'Tag',
      },
    });
  }

  async updateCategory(id: string, data: { name?: string; color?: string; icon?: string }) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }

  async getAllTags(userId: string): Promise<string[]> {
    const txns = await this.prisma.transaction.findMany({
      where: { statement: { userId } },
      select: { tags: true },
    });
    const tagSet = new Set<string>();
    txns.forEach((t) => {
      if (Array.isArray(t.tags)) {
        t.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }
}
