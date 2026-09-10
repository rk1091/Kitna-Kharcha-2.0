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

