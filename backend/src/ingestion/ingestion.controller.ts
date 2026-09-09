import { Controller, Post, UseInterceptors, UploadedFile, Body, Req, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IngestionService } from './ingestion.service';
import { importTextSchema } from './dto/import-text.dto';
import { Request } from 'express';

@Controller('statements')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadStatement(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const userId = (req as any).user?.id || 'default-user-id';
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
}
