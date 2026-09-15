import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecurringService } from './recurring.service';

@Controller('recurring')
@UseGuards(JwtAuthGuard)
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Get()
  async getRecurring(@Req() req: any) {
    const userId = req.user.id;
    return this.recurringService.getRecurring(userId);
  }

  @Post('detect')
  async detectRecurring(@Req() req: any) {
    const userId = req.user.id;
    return this.recurringService.detectRecurring(userId);
  }

  @Patch(':id/toggle')
  async toggleRecurring(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.recurringService.toggleRecurring(userId, id);
  }
}
