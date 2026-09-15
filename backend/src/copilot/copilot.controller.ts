import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CopilotService } from './copilot.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('copilot')
@UseGuards(JwtAuthGuard)
export class CopilotController {
  constructor(private readonly copilotService: CopilotService) {}

  @Post('ask')
  async ask(@Body('question') question: string, @Req() req: any) {
    // Hardcode user ID for Phase 2 testing
    const userId = req.user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    
    if (!question) {
      return { answer: "Please ask a question." };
    }

    const answer = await this.copilotService.askCopilot(userId, question);
    return { answer };
  }
}
