import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request, Response } from 'express';

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('csv')
  async exportCSV(
    @Req() req: Request,
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    const csv = await this.exportService.exportCSV(userId, { from, to, categoryId });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions-export.csv"');
    return res.send(csv);
  }

  @Get('excel')
  async exportExcel(
    @Req() req: Request,
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
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
    @Req() req: Request,
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    const html = await this.exportService.exportExecutiveReport(userId, { from, to });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  }
}
