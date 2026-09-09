import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { BadRequestException } from '@nestjs/common';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockIngestionService = {
  handleFileUpload: vi.fn(),
  handleTextImport: vi.fn(),
};

describe('IngestionController', () => {
  let controller: IngestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        {
          provide: IngestionService,
          useValue: mockIngestionService,
        },
      ],
    }).compile();

    controller = module.get<IngestionController>(IngestionController);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should upload statement', async () => {
    const file = { buffer: Buffer.from('test') } as Express.Multer.File;
    const req = { user: { id: 'user-1' } } as any;
    
    mockIngestionService.handleFileUpload.mockResolvedValue('success');
    
    const result = await controller.uploadStatement(file, req);
    expect(result).toBe('success');
    expect(mockIngestionService.handleFileUpload).toHaveBeenCalledWith('user-1', file);
  });

  it('should throw if no file', async () => {
    const req = { user: { id: 'user-1' } } as any;
    
    await expect(controller.uploadStatement(null as any, req)).rejects.toThrow(BadRequestException);
  });

  it('should import text', async () => {
    const req = { user: { id: 'user-1' } } as any;
    const body = { text: 'some text' };
    
    mockIngestionService.handleTextImport.mockResolvedValue('success');
    
    const result = await controller.importText(body, req);
    expect(result).toBe('success');
    expect(mockIngestionService.handleTextImport).toHaveBeenCalledWith('user-1', { text: 'some text' });
  });

  it('should throw if invalid body for import text', async () => {
    const req = { user: { id: 'user-1' } } as any;
    const body = { wrong: 'some text' };
    
    await expect(controller.importText(body, req)).rejects.toThrow(BadRequestException);
  });
});
