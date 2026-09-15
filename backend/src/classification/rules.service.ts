import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RuleSource, Prisma } from '@prisma/client';

export interface CreateRuleDto {
  name: string;
  conditions: any;
  categoryId: string;
  tags?: string[];
  priority?: number;
  isActive?: boolean;
}

export interface UpdateRuleDto {
  name?: string;
  conditions?: any;
  categoryId?: string;
  tags?: string[];
  priority?: number;
  isActive?: boolean;
}

@Injectable()
export class RulesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRules(userId: string) {
    return this.prisma.classificationRule.findMany({
      where: {
        OR: [
          { userId },
          { isSystem: true },
          { userId: null },
        ],
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        category: true,
      },
    });
  }

  async getRuleById(userId: string, id: string) {
    const rule = await this.prisma.classificationRule.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!rule) {
      throw new NotFoundException(`Rule ${id} not found`);
    }

    if (!rule.isSystem && rule.userId && rule.userId !== userId) {
      throw new ForbiddenException('Access denied to this rule');
    }

    return rule;
  }

  async createRule(userId: string, dto: CreateRuleDto) {
    return this.prisma.classificationRule.create({
      data: {
        userId,
        name: dto.name,
        conditions: dto.conditions,
        categoryId: dto.categoryId,
        tags: dto.tags || [],
        priority: dto.priority ?? 50,
        isActive: dto.isActive ?? true,
        isSystem: false,
        source: RuleSource.USER,
      },
      include: {
        category: true,
      },
    });
  }

  async updateRule(userId: string, id: string, dto: UpdateRuleDto) {
    const rule = await this.prisma.classificationRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException(`Rule ${id} not found`);
    }

    if (rule.isSystem || rule.userId !== userId) {
      throw new ForbiddenException('Cannot modify system rules or rules created by other users');
    }

    const updateData: Prisma.ClassificationRuleUpdateInput = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.conditions !== undefined) updateData.conditions = dto.conditions;
    if (dto.categoryId !== undefined) updateData.category = { connect: { id: dto.categoryId } };
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    return this.prisma.classificationRule.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });
  }

  async deleteRule(userId: string, id: string) {
    const rule = await this.prisma.classificationRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException(`Rule ${id} not found`);
    }

    if (rule.isSystem || rule.userId !== userId) {
      throw new ForbiddenException('Cannot delete system rules or rules created by other users');
    }

    await this.prisma.classificationRule.delete({
      where: { id },
    });

    return { success: true, deletedId: id };
  }
}
