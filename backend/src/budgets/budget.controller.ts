import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BudgetService, CreateBudgetDto, UpdateBudgetDto } from './budget.service';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  async getBudgets(@Req() req: any) {
    const userId = req.user.id;
    return this.budgetService.getBudgets(userId);
  }

  @Get('status')
  async getBudgetStatus(@Req() req: any) {
    const userId = req.user.id;
    return this.budgetService.getBudgetStatus(userId);
  }

  @Post()
  async createBudget(@Req() req: any, @Body() dto: CreateBudgetDto) {
    const userId = req.user.id;
    return this.budgetService.createBudget(userId, dto);
  }

  @Put(':id')
  async updateBudget(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    const userId = req.user.id;
    return this.budgetService.updateBudget(userId, id, dto);
  }

  @Delete(':id')
  async deleteBudget(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.budgetService.deleteBudget(userId, id);
  }
}
