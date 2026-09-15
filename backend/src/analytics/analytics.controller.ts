import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

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
}
