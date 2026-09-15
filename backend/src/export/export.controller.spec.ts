import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';

const mockExportService = {
  exportCSV: vi.fn(),
  exportExcel: vi.fn(),
  exportExecutiveReport: vi.fn(),
};

describe('ExportController (Task E1)', () => {
  let controller: ExportController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new ExportController(mockExportService as unknown as ExportService);
  });

  it('should stream CSV with attachment header', async () => {
    mockExportService.exportCSV.mockResolvedValue('Date,Amount\n2026-01-01,100');
    const req = { user: { id: 'user-1' } } as any;
    const res = {
      setHeader: vi.fn(),
      send: vi.fn((val) => val),
    } as any;

    await controller.exportCSV(req, res);
    expect(mockExportService.exportCSV).toHaveBeenCalledWith('user-1', {
      from: undefined,
      to: undefined,
      categoryId: undefined,
    });
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(res.send).toHaveBeenCalledWith('Date,Amount\n2026-01-01,100');
  });

  it('should stream Excel XLSX with attachment header', async () => {
    const dummyBuffer = Buffer.from('mock-excel');
    mockExportService.exportExcel.mockResolvedValue(dummyBuffer);
    const req = { user: { id: 'user-1' } } as any;
    const res = {
      setHeader: vi.fn(),
      send: vi.fn((val) => val),
    } as any;

    await controller.exportExcel(req, res);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(res.send).toHaveBeenCalledWith(dummyBuffer);
  });

  it('should stream HTML report', async () => {
    mockExportService.exportExecutiveReport.mockResolvedValue('<html>Report</html>');
    const req = { user: { id: 'user-1' } } as any;
    const res = {
      setHeader: vi.fn(),
      send: vi.fn((val) => val),
    } as any;

    await controller.exportExecutiveReport(req, res);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html; charset=utf-8');
    expect(res.send).toHaveBeenCalledWith('<html>Report</html>');
  });
});
