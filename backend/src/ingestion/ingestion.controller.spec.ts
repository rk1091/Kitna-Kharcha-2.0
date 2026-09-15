import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { BadRequestException } from '@nestjs/common';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockIngestionService = {
  handleFileUpload: vi.fn(),
  handleTextImport: vi.fn(),
  getAllStatements: vi.fn(),
  getStatementById: vi.fn(),
  deleteStatement: vi.fn(),
  reclassifyStatement: vi.fn(),
};

describe('IngestionController', () => {
  let controller: IngestionController;

  beforeEach(() => {
    controller = new IngestionController(mockIngestionService as unknown as IngestionService);
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

  it('should get all statements for user', async () => {
    const req = { user: { id: 'user-1' } } as any;
    const expected = [{ id: 's1', fileName: 'hdfc.pdf' }];
    mockIngestionService.getAllStatements.mockResolvedValue(expected);

    const result = await controller.getStatements(req);
    expect(result).toEqual(expected);
    expect(mockIngestionService.getAllStatements).toHaveBeenCalledWith('user-1');
  });

  it('should get statement by id', async () => {
    const req = { user: { id: 'user-1' } } as any;
    const expected = { id: 's1', fileName: 'hdfc.pdf' };
    mockIngestionService.getStatementById.mockResolvedValue(expected);

    const result = await controller.getStatementById('s1', req);
    expect(result).toEqual(expected);
    expect(mockIngestionService.getStatementById).toHaveBeenCalledWith('user-1', 's1');
  });

  it('should delete statement', async () => {
    const req = { user: { id: 'user-1' } } as any;
    mockIngestionService.deleteStatement.mockResolvedValue({ success: true });

    const result = await controller.deleteStatement('s1', req);
    expect(result).toEqual({ success: true });
    expect(mockIngestionService.deleteStatement).toHaveBeenCalledWith('user-1', 's1');
  });

  it('should reclassify statement', async () => {
    const req = { user: { id: 'user-1' } } as any;
    mockIngestionService.reclassifyStatement.mockResolvedValue({ success: true });

    const result = await controller.reclassifyStatement('s1', req);
    expect(result).toEqual({ success: true });
    expect(mockIngestionService.reclassifyStatement).toHaveBeenCalledWith('user-1', 's1');
  });
});
