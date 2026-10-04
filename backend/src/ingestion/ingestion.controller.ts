import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IngestionService } from './ingestion.service';
import { importTextSchema } from './dto/import-text.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('statements')
@UseGuards(JwtAuthGuard)
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Get()
  async getStatements(@CurrentUser() userId: string) {
    return this.ingestionService.getAllStatements(userId);
  }

  @Get(':id')
  async getStatementById(
    @Param('id') id: string,
    @CurrentUser() userId: string,
  ) {
    return this.ingestionService.getStatementById(userId, id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadStatement(
    @UploadedFile() file: Express.Multer.File,
    @Body('password') password: string | undefined,
    @CurrentUser() userId: string,
    @Body('columnMapping') columnMapping?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (columnMapping !== undefined) {
      return this.ingestionService.handleFileUpload(userId, file, password, columnMapping);
    }
    return this.ingestionService.handleFileUpload(userId, file, password);
  }

  @Post('import-text')
  async importText(
    @Body() body: unknown,
    @CurrentUser() userId: string,
  ) {
    const parsed = importTextSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.format());
    }
    
    return this.ingestionService.handleTextImport(userId, parsed.data);
  }

  @Delete(':id')
  async deleteStatement(
    @Param('id') id: string,
    @CurrentUser() userId: string,
  ) {
    return this.ingestionService.deleteStatement(userId, id);
  }

  @Post(':id/reclassify')
  async reclassifyStatement(
    @Param('id') id: string,
    @CurrentUser() userId: string,
  ) {
    return this.ingestionService.reclassifyStatement(userId, id);
  }
}
