import { Controller, Get, Query, UseGuards, Req, Optional } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { LlmTrackerService } from '../llm/observability/llm-tracker.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    @Optional() private readonly llmTrackerService?: LlmTrackerService,
  ) {}

  @Get('trends')
  async getTrends(@Req() req: any, @Query('months') months?: string) {
    const userId = req.user.id;
    const numMonths = months ? parseInt(months, 10) : 6;
    return this.analyticsService.getTrends(userId, isNaN(numMonths) ? 6 : numMonths);
  }

  @Get('merchants/velocity')
  async getMerchantVelocity(@Req() req: any, @Query('top') top?: string) {
    const userId = req.user.id;
    const topN = top ? parseInt(top, 10) : 10;
    return this.analyticsService.getMerchantVelocity(userId, isNaN(topN) ? 10 : topN);
  }

  @Get('llm-usage')
  async getLlmUsage(@Req() req: any) {
    const userId = req.user?.id;
    if (!this.llmTrackerService) {
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
    return this.llmTrackerService.getUsageSummary(userId);
  }
}
