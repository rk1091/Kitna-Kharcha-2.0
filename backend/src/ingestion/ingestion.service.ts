import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InputType, ParseStatus, StatementUpload } from '@prisma/client';
import { ImportTextDto } from './dto/import-text.dto';
import { CSVIngester } from './parsers/csv-ingester';
import { ExcelIngester } from './parsers/excel-ingester';
import { TextIngester } from './parsers/text-ingester';
import { PDFIngester } from './parsers/pdf-ingester';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as fs from 'fs';

@Injectable()
export class IngestionService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('statements') private readonly statementQueue: Queue
  ) {}

  async handleFileUpload(
    userId: string,
    file: Express.Multer.File,
    password?: string,
  ): Promise<StatementUpload> {
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
      if (inputType === InputType.PDF && password) {
        await (parser as PDFIngester).parse(file.buffer, { password });
      } else {
        await parser.parse(file.buffer);
      }
    }

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

  async getAllStatements(userId: string) {
    return this.prisma.statementUpload.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });
  }

  async getStatementById(userId: string, id: string) {
    const statement = await this.prisma.statementUpload.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!statement) {
      throw new NotFoundException(`Statement ${id} not found`);
    }

    return statement;
  }

  async deleteStatement(userId: string, id: string) {
    const statement = await this.prisma.statementUpload.findFirst({
      where: { id, userId },
    });

    if (!statement) {
      throw new NotFoundException(`Statement ${id} not found`);
    }

    // Cascading delete removes all associated transactions via Prisma schema relation
    await this.prisma.statementUpload.delete({
      where: { id },
    });

    if (statement.filePath && fs.existsSync(statement.filePath)) {
      try {
        fs.unlinkSync(statement.filePath);
      } catch {
        // Ignore file removal errors if file was already moved or removed
      }
    }

    return { success: true, deletedId: id };
  }

  async reclassifyStatement(userId: string, id: string) {
    const statement = await this.prisma.statementUpload.findFirst({
      where: { id, userId },
    });

    if (!statement) {
      throw new NotFoundException(`Statement ${id} not found`);
    }

    await this.prisma.statementUpload.update({
      where: { id },
      data: { parseStatus: ParseStatus.PENDING },
    });

    await this.statementQueue.add('process-statement', { statementId: id });

    return { success: true, message: 'Statement queued for re-processing', statementId: id };
  }
}
