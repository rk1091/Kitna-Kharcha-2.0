import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RecordLlmLogDto {
  userId?: string;
  operation: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  latencyMs: number;
  toolCalls?: string | object[];
  isSuccess?: boolean;
  errorMessage?: string;
}

export interface LlmUsageSummary {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalEstimatedCostUsd: number;
  avgLatencyMs: number;
  callsByModel: Record<string, number>;
  callsByOperation: Record<string, number>;
  recentLogs: Array<{
    id: string;
    userId: string | null;
    operation: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs: number;
    estimatedCostUsd: number;
    toolCalls: string | null;
    isSuccess: boolean;
    errorMessage: string | null;
    createdAt: Date;
  }>;
}

export function calculateLlmCost(model: string, promptTokens: number, completionTokens: number): number {
  const m = (model || '').toLowerCase();
  let inputCostPerMillion = 0.075;
  let outputCostPerMillion = 0.30;

  if (m.includes('pro')) {
    inputCostPerMillion = 1.25;
    outputCostPerMillion = 5.00;
  } else if (m.includes('flash')) {
    inputCostPerMillion = 0.075;
    outputCostPerMillion = 0.30;
  }

  const cost = (promptTokens * inputCostPerMillion + completionTokens * outputCostPerMillion) / 1_000_000;
  return Math.round(cost * 1e8) / 1e8;
}

@Injectable()
export class LlmTrackerService {
  private readonly logger = new Logger(LlmTrackerService.name);

  constructor(private readonly prisma?: PrismaService) {}

  async recordLog(dto: RecordLlmLogDto) {
    const promptTokens = dto.promptTokens || 0;
    const completionTokens = dto.completionTokens || 0;
    const totalTokens = dto.totalTokens || (promptTokens + completionTokens);
    const estimatedCostUsd = calculateLlmCost(dto.model, promptTokens, completionTokens);
    const isSuccess = dto.isSuccess ?? (dto.errorMessage ? false : true);

    const serializedToolCalls = dto.toolCalls
      ? typeof dto.toolCalls === 'string'
        ? dto.toolCalls
        : JSON.stringify(dto.toolCalls)
      : null;

    if (!this.prisma) {
      this.logger.debug(
        `[LLM Track] model=${dto.model} op=${dto.operation} latency=${dto.latencyMs}ms tokens=${totalTokens} cost=$${estimatedCostUsd}`
      );
      return null;
    }

    try {
      return await this.prisma.llmLog.create({
        data: {
          userId: dto.userId || null,
          operation: dto.operation,
          model: dto.model,
          promptTokens,
          completionTokens,
          totalTokens,
          latencyMs: dto.latencyMs,
          estimatedCostUsd,
          toolCalls: serializedToolCalls,
          isSuccess,
          errorMessage: dto.errorMessage || null,
        },
      });
    } catch (err: any) {
      this.logger.warn(`Failed to persist LlmLog: ${err.message}`);
      return null;
    }
  }

  async getUsageSummary(userId?: string): Promise<LlmUsageSummary> {
    if (!this.prisma) {
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalTokens: 0,
        totalEstimatedCostUsd: 0,
        avgLatencyMs: 0,
        callsByModel: {},
        callsByOperation: {},
        recentLogs: [],
      };
    }

    const where = userId ? { userId } : {};

    const [logs, aggregate] = await Promise.all([
      this.prisma.llmLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.llmLog.aggregate({
        where,
        _count: { id: true },
        _sum: {
          promptTokens: true,
          completionTokens: true,
          totalTokens: true,
          estimatedCostUsd: true,
          latencyMs: true,
        },
        _avg: {
          latencyMs: true,
        },
      }),
    ]);

    const totalCalls = aggregate._count.id || 0;
    const callsByModel: Record<string, number> = {};
    const callsByOperation: Record<string, number> = {};
    let successfulCalls = 0;
    let failedCalls = 0;

    const allGroupData = await this.prisma.llmLog.findMany({
      where,
      select: {
        model: true,
        operation: true,
        isSuccess: true,
      },
    });

    for (const item of allGroupData) {
      callsByModel[item.model] = (callsByModel[item.model] || 0) + 1;
      callsByOperation[item.operation] = (callsByOperation[item.operation] || 0) + 1;
      if (item.isSuccess) {
        successfulCalls++;
      } else {
        failedCalls++;
      }
    }

    return {
      totalCalls,
      successfulCalls,
      failedCalls,
      totalPromptTokens: aggregate._sum.promptTokens || 0,
      totalCompletionTokens: aggregate._sum.completionTokens || 0,
      totalTokens: aggregate._sum.totalTokens || 0,
      totalEstimatedCostUsd: Math.round((aggregate._sum.estimatedCostUsd || 0) * 1e6) / 1e6,
      avgLatencyMs: Math.round(aggregate._avg.latencyMs || 0),
      callsByModel,
      callsByOperation,
      recentLogs: logs.slice(0, 20) as any,
    };
  }
}
