import {
  Controller,
  Get,
  Req,
  UseGuards,
  Patch,
  Param,
  Body,
  Delete,
  Post,
  Query,
} from '@nestjs/common';
import { TransactionsService, TransactionFilters } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getTransactions(@Req() req: Request, @Query() query: TransactionFilters) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.transactionsService.getTransactions(userId, query);
  }

  @Get('statements')
  async getStatements(@Req() req: Request) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.transactionsService.getStatementUploads(userId);
  }

  @Get('categories/all')
  async getCategories() {
    return this.transactionsService.getCategories();
  }

  @Get('tags/all')
  async getTags(@Req() req: Request) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.transactionsService.getAllTags(userId);
  }

  @Patch(':id')
  async updateTransaction(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.transactionsService.updateTransaction(userId, id, body);
  }

  @Delete(':id')
  async deleteTransaction(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.transactionsService.deleteTransaction(userId, id);
  }

  @Post('bulk-categorize')
  async bulkCategorize(
    @Body() body: { transactionIds: string[]; categoryId: string },
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.transactionsService.bulkCategorize(userId, body.transactionIds, body.categoryId);
  }

  @Post('bulk-delete')
  async bulkDelete(
    @Body() body: { transactionIds: string[] },
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.transactionsService.bulkDelete(userId, body.transactionIds);
  }
}
