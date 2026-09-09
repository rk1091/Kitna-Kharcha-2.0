import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InputType, ParseStatus, StatementUpload } from '@prisma/client';
import { ImportTextDto } from './dto/import-text.dto';
import { CSVIngester } from './parsers/csv-ingester';
import { ExcelIngester } from './parsers/excel-ingester';
import { TextIngester } from './parsers/text-ingester';

@Injectable()
export class IngestionService {
  constructor(private readonly prisma: PrismaService) {}

  async handleFileUpload(userId: string, file: Express.Multer.File): Promise<StatementUpload> {
    let inputType: InputType;
    let parser;

    const mimeType = file.mimetype;
    if (mimeType === 'text/csv' || file.originalname.endsWith('.csv')) {
      inputType = InputType.CSV;
      parser = new CSVIngester();
    } else if (
      mimeType === 'application/vnd.ms-excel' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.originalname.endsWith('.xls') ||
      file.originalname.endsWith('.xlsx')
    ) {
      inputType = InputType.EXCEL;
      parser = new ExcelIngester();
    } else {
      throw new BadRequestException(`Unsupported file type: ${mimeType}`);
    }

    if (file.buffer) {
      await parser.parse(file.buffer);
    }

    const filePath = file.path || `uploads/${file.originalname}`;

    return this.prisma.statementUpload.create({
      data: {
        userId,
        fileName: file.originalname,
        filePath,
        inputType,
        parseStatus: ParseStatus.PENDING,
      },
    });
  }

  async handleTextImport(userId: string, dto: ImportTextDto): Promise<StatementUpload> {
    const inputType = InputType.TEXT;
    const parser = new TextIngester();
    
    await parser.parse(Buffer.from(dto.text, 'utf-8'));

    const filePath = 'text-import.txt';

    return this.prisma.statementUpload.create({
      data: {
        userId,
        fileName: filePath,
        filePath: filePath,
        inputType,
        parseStatus: ParseStatus.PENDING,
      },
    });
  }
}
