import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { CopilotService } from './copilot.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('copilot')
@UseGuards(JwtAuthGuard)
export class CopilotController {
  constructor(private readonly copilotService: CopilotService) {}

  @Get('history')
  async getHistory(@CurrentUser() userId: string) {
    const messages = await this.copilotService.getSessionHistory(userId);
    return { messages };
  }

  @Post('clear')
  async clearHistory(@CurrentUser() userId: string) {
    return this.copilotService.clearSessionHistory(userId);
  }

  @Post('ask')
  async ask(
    @Body('question') question: string,
    @CurrentUser() userId: string,
  ) {
    if (!question) {
      return { answer: 'Please ask a question.' };
    }

    const answer = await this.copilotService.askCopilot(userId, question);
    return { answer };
  }
}
