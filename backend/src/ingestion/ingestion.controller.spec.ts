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
    
    mockIngestionService.handleFileUpload.mockResolvedValue('success');
    
    const result = await controller.uploadStatement(file, 'pass123', 'user-1');
    expect(result).toBe('success');
    expect(mockIngestionService.handleFileUpload).toHaveBeenCalledWith('user-1', file, 'pass123');
  });

  it('should upload statement with custom column mapping', async () => {
    const file = { buffer: Buffer.from('test') } as Express.Multer.File;
    const mapping = '{"date":0,"description":1,"amount":2}';

    mockIngestionService.handleFileUpload.mockResolvedValue('success');

    const result = await controller.uploadStatement(file, undefined, 'user-1', mapping);
    expect(result).toBe('success');
    expect(mockIngestionService.handleFileUpload).toHaveBeenCalledWith('user-1', file, undefined, mapping);
  });

  it('should throw if no file', async () => {
    await expect(controller.uploadStatement(null as any, undefined, 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('should import text', async () => {
    const body = { text: 'some text' };
    
    mockIngestionService.handleTextImport.mockResolvedValue('success');
    
    const result = await controller.importText(body, 'user-1');
    expect(result).toBe('success');
    expect(mockIngestionService.handleTextImport).toHaveBeenCalledWith('user-1', { text: 'some text' });
  });

  it('should throw if invalid body for import text', async () => {
    const body = { wrong: 'some text' };
    
    await expect(controller.importText(body, 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('should get all statements for user', async () => {
    const expected = [{ id: 's1', fileName: 'hdfc.pdf' }];
    mockIngestionService.getAllStatements.mockResolvedValue(expected);

    const result = await controller.getStatements('user-1');
    expect(result).toEqual(expected);
    expect(mockIngestionService.getAllStatements).toHaveBeenCalledWith('user-1');
  });

  it('should get statement by id', async () => {
    const expected = { id: 's1', fileName: 'hdfc.pdf' };
    mockIngestionService.getStatementById.mockResolvedValue(expected);

    const result = await controller.getStatementById('s1', 'user-1');
    expect(result).toEqual(expected);
    expect(mockIngestionService.getStatementById).toHaveBeenCalledWith('user-1', 's1');
  });

  it('should delete statement', async () => {
    mockIngestionService.deleteStatement.mockResolvedValue({ success: true });

    const result = await controller.deleteStatement('s1', 'user-1');
    expect(result).toEqual({ success: true });
    expect(mockIngestionService.deleteStatement).toHaveBeenCalledWith('user-1', 's1');
  });

  it('should reclassify statement', async () => {
    mockIngestionService.reclassifyStatement.mockResolvedValue({ success: true });

    const result = await controller.reclassifyStatement('s1', 'user-1');
    expect(result).toEqual({ success: true });
    expect(mockIngestionService.reclassifyStatement).toHaveBeenCalledWith('user-1', 's1');
  });
});
