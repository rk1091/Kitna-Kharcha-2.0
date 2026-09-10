import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async getRecentTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: { statement: { userId } },
      orderBy: { txnDate: 'desc' },
      take: 100,
      include: {
        category: true,
        merchant: true,
      }
    });
  }

  async getStatementUploads(userId: string) {
    return this.prisma.statementUpload.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      take: 10,
    });
  }

  async updateTransaction(id: string, data: { categoryId?: string; tags?: string[] }) {
    const updateData: any = {};
    if (data.categoryId) updateData.categoryId = data.categoryId;
    if (data.tags) updateData.tags = data.tags;
    
    // Auto-Learning Engine: Create a smart rule when user overrides category
    if (data.categoryId) {
      const txn = await this.prisma.transaction.findUnique({ 
        where: { id }, 
        include: { statement: true } 
      });
      
      if (txn && txn.categoryId !== data.categoryId) {
        updateData.classificationReason = 'MANUAL_OVERRIDE';
        updateData.isManualOverride = true;
        
        // Check if rule already exists
        const existingRule = await this.prisma.classificationRule.findFirst({
          where: {
            userId: txn.statement.userId,
            categoryId: data.categoryId,
            source: 'AI_LEARNED',
            name: `Auto-Learned: ${txn.normalizedDescription}`
          }
        });

        if (!existingRule) {
          await this.prisma.classificationRule.create({
            data: {
              userId: txn.statement.userId,
              name: `Auto-Learned: ${txn.normalizedDescription}`,
              categoryId: data.categoryId,
              conditions: {
                field: 'normalizedDescription',
                operator: 'equals',
                value: txn.normalizedDescription
              },
              source: 'AI_LEARNED',
              priority: 100, // User overrides get highest priority
            }
          });
        }
      }
    }

    return this.prisma.transaction.update({
      where: { id },
      data: updateData,
      include: { category: true }
    });
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
  }
}

