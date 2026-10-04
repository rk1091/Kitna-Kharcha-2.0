import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InsightsService } from './insights.service';

@Controller('insights')
@UseGuards(JwtAuthGuard)
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('feed')
  async getInsightsFeed(@Req() req: any) {
    const userId = req.user.id;
    return this.insightsService.getInsightsFeed(userId);
  }
}
