import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IngestionService } from './ingestion.service';
import { importTextSchema } from './dto/import-text.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('statements')
@UseGuards(JwtAuthGuard)
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Get()
  async getStatements(@Req() req: Request) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.ingestionService.getAllStatements(userId);
  }

  @Get(':id')
  async getStatementById(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.ingestionService.getStatementById(userId, id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadStatement(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.ingestionService.handleFileUpload(userId, file);
  }

  @Post('import-text')
  async importText(
    @Body() body: unknown,
    @Req() req: Request
  ) {
    const parsed = importTextSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.format());
    }
    
    const userId = (req as any).user?.id || 'default-user-id';
    return this.ingestionService.handleTextImport(userId, parsed.data);
  }

  @Delete(':id')
  async deleteStatement(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.ingestionService.deleteStatement(userId, id);
  }

  @Post(':id/reclassify')
  async reclassifyStatement(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.ingestionService.reclassifyStatement(userId, id);
  }
}
