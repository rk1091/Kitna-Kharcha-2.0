import {
  Controller,
  Get,
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
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getTransactions(
    @CurrentUser() userId: string,
    @Query() query: TransactionFilters,
  ) {
    return this.transactionsService.getTransactions(userId, query);
  }

  @Get('statements')
  async getStatements(@CurrentUser() userId: string) {
    return this.transactionsService.getStatementUploads(userId);
  }

  @Get('categories/all')
  async getCategories() {
    return this.transactionsService.getCategories();
  }

  @Post('categories')
  async createCategory(@Body() body: any) {
    return this.transactionsService.createCategory(body);
  }

  @Patch('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    return this.transactionsService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.transactionsService.deleteCategory(id);
  }

  @Get('tags/all')
  async getTags(@CurrentUser() userId: string) {
    return this.transactionsService.getAllTags(userId);
  }

  @Patch(':id')
  async updateTransaction(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() userId: string,
  ) {
    return this.transactionsService.updateTransaction(userId, id, body);
  }

  @Delete(':id')
  async deleteTransaction(
    @Param('id') id: string,
    @CurrentUser() userId: string,
  ) {
    return this.transactionsService.deleteTransaction(userId, id);
  }

  @Post('bulk-categorize')
  async bulkCategorize(
    @Body() body: { transactionIds: string[]; categoryId: string },
    @CurrentUser() userId: string,
  ) {
    return this.transactionsService.bulkCategorize(userId, body.transactionIds, body.categoryId);
  }

  @Post('bulk-delete')
  async bulkDelete(
    @Body() body: { transactionIds: string[] },
    @CurrentUser() userId: string,
  ) {
    return this.transactionsService.bulkDelete(userId, body.transactionIds);
  }
}
