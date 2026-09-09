import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { PrismaService } from '../prisma/prisma.service';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as xlsx from 'xlsx';

const mockPrismaService = {
  statementUpload: {
    create: vi.fn(),
  },
};

describe('IngestionService', () => {
  let service: IngestionService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = mockPrismaService as unknown as PrismaService;
    service = new IngestionService(prisma);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleFileUpload', () => {
    it('should process CSV and create StatementUpload', async () => {
      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.csv',
        encoding: '7bit',
        mimetype: 'text/csv',
        buffer: Buffer.from('Date,Amount\n2023-01-01,100', 'utf-8'),
        size: 100,
        destination: '',
        filename: 'test.csv',
        path: 'temp-path',
        stream: null as any,
      };
      
      const mockResult = { id: 'test-id' };
      mockPrismaService.statementUpload.create.mockResolvedValue(mockResult);

      const result = await service.handleFileUpload('user-1', file);

      expect(mockPrismaService.statementUpload.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          fileName: 'test.csv',
          inputType: 'CSV',
          parseStatus: 'PENDING',
        }),
      });
      expect(result).toEqual(mockResult);
    });

    it('should process Excel and create StatementUpload', async () => {
      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.aoa_to_sheet([]);
      xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
      const dummyBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.xlsx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: dummyBuffer,
        size: 100,
        destination: '',
        filename: 'test.xlsx',
        path: 'temp-path',
        stream: null as any,
      };
      
      const mockResult = { id: 'test-id' };
      mockPrismaService.statementUpload.create.mockResolvedValue(mockResult);

      const result = await service.handleFileUpload('user-1', file);

      expect(mockPrismaService.statementUpload.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          fileName: 'test.xlsx',
          inputType: 'EXCEL',
          parseStatus: 'PENDING',
        }),
      });
    });
    
    it('should throw error for unsupported file type', async () => {
      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('dummy', 'utf-8'),
        size: 100,
        destination: '',
        filename: 'test.pdf',
        path: 'temp-path',
        stream: null as any,
      };
      
      await expect(service.handleFileUpload('user-1', file)).rejects.toThrow('Unsupported file type: application/pdf');
    });
  });

  describe('handleTextImport', () => {
    it('should process text and create StatementUpload', async () => {
      const mockResult = { id: 'test-id' };
      mockPrismaService.statementUpload.create.mockResolvedValue(mockResult);

      const result = await service.handleTextImport('user-1', { text: 'test data' });

      expect(mockPrismaService.statementUpload.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          fileName: 'text-import.txt',
          inputType: 'TEXT',
          parseStatus: 'PENDING',
        }),
      });
      expect(result).toEqual(mockResult);
    });
  });
});
