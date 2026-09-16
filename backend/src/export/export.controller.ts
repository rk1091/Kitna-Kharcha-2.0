import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Response } from 'express';

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('csv')
  async exportCSV(
    @CurrentUser() userId: string,
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const csv = await this.exportService.exportCSV(userId, { from, to, categoryId });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions-export.csv"');
    return res.send(csv);
  }

  @Get('excel')
  async exportExcel(
    @CurrentUser() userId: string,
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const buffer = await this.exportService.exportExcel(userId, { from, to, categoryId });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename="transactions-export.xlsx"');
    return res.send(buffer);
  }

  @Get('report')
  async exportExecutiveReport(
    @CurrentUser() userId: string,
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const html = await this.exportService.exportExecutiveReport(userId, { from, to });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  }
}
