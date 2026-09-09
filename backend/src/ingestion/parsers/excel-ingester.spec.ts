import { describe, it, expect } from 'vitest';
import { ExcelIngester } from './excel-ingester';
import * as xlsx from 'xlsx';

describe('ExcelIngester', () => {
  it('should parse Excel buffer correctly', async () => {
    const ingester = new ExcelIngester();
    
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet([
      ['Date', 'Amount', 'Description'],
      ['2023-01-01', 100, 'Food'],
      ['2023-01-02', 200, 'Rent']
    ]);
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    const result = await ingester.parse(buffer);
    
    expect(result.headers).toEqual(['Date', 'Amount', 'Description']);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual(['2023-01-01', '100', 'Food']);
    expect(result.rows[1]).toEqual(['2023-01-02', '200', 'Rent']);
  });

  it('should handle empty workbook gracefully', async () => {
    const ingester = new ExcelIngester();
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet([]);
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    const result = await ingester.parse(buffer);
    
    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
  });
});
