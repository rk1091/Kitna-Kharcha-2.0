import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InputType, ParseStatus, StatementUpload } from '@prisma/client';
import { ImportTextDto } from './dto/import-text.dto';
import { CSVIngester } from './parsers/csv-ingester';
import { ExcelIngester } from './parsers/excel-ingester';
import { TextIngester } from './parsers/text-ingester';
import { PDFIngester } from './parsers/pdf-ingester';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class IngestionService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('statements') private readonly statementQueue: Queue
  ) {}

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
    } else if (mimeType === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      inputType = InputType.PDF;
      parser = new PDFIngester();
    } else {
      throw new BadRequestException(`Unsupported file type: ${mimeType}`);
    }

    if (file.buffer) {
      await parser.parse(file.buffer);
    }

    const fs = require('fs');
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
    
    const filePath = file.path || `uploads/${file.originalname}`;
    if (file.buffer) {
      fs.writeFileSync(filePath, file.buffer);
    }

    const upload = await this.prisma.statementUpload.create({
      data: {
        userId,
        fileName: file.originalname,
        filePath,
        inputType,
        parseStatus: ParseStatus.PENDING,
      },
    });

    await this.statementQueue.add('process-statement', { statementId: upload.id });

    return upload;
  }

  async handleTextImport(userId: string, dto: ImportTextDto): Promise<StatementUpload> {
    const inputType = InputType.TEXT;
    const parser = new TextIngester();
    
    await parser.parse(Buffer.from(dto.text, 'utf-8'));

    const fs = require('fs');
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
    const filePath = `uploads/text-import-${Date.now()}.txt`;
    fs.writeFileSync(filePath, dto.text);

    const upload = await this.prisma.statementUpload.create({
      data: {
        userId,
        fileName: filePath,
        filePath: filePath,
        inputType,
        parseStatus: ParseStatus.PENDING,
      },
    });

    await this.statementQueue.add('process-statement', { statementId: upload.id });

    return upload;
  }
}
