import { describe, it, expect } from 'vitest';
import { CSVIngester } from './csv-ingester';

describe('CSVIngester', () => {
  it('should parse CSV buffer correctly', async () => {
    const ingester = new CSVIngester();
    const csvContent = 'Date,Amount,Description\n2023-01-01,100,Food\n2023-01-02,200,Rent';
    const buffer = Buffer.from(csvContent, 'utf-8');
    
    const result = await ingester.parse(buffer);
    
    expect(result.headers).toEqual(['Date', 'Amount', 'Description']);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual(['2023-01-01', '100', 'Food']);
    expect(result.rows[1]).toEqual(['2023-01-02', '200', 'Rent']);
  });
  
  it('should handle empty file', async () => {
    const ingester = new CSVIngester();
    const buffer = Buffer.from('', 'utf-8');
    
    const result = await ingester.parse(buffer);
    
    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
  });
});
