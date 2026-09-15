import { Controller, Get, Req, UseGuards, Patch, Param, Body } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getTransactions(@Req() req: Request) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5'; // using your seed user ID
    return this.transactionsService.getRecentTransactions(userId);
  }

  @Get('statements')
  async getStatements(@Req() req: Request) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.transactionsService.getStatementUploads(userId);
  }

  @Patch(':id')
  async updateTransaction(@Param('id') id: string, @Body() body: any) {
    return this.transactionsService.updateTransaction(id, body);
  }

  @Get('categories/all')
  async getCategories() {
    return this.transactionsService.getCategories();
  }
}

