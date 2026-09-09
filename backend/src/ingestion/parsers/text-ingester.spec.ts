import { describe, it, expect } from 'vitest';
import { TextIngester } from './text-ingester';

describe('TextIngester', () => {
  it('should parse text buffer correctly', async () => {
    const ingester = new TextIngester();
    const textContent = 'First line\nSecond line\nThird line';
    const buffer = Buffer.from(textContent, 'utf-8');
    
    const result = await ingester.parse(buffer);
    
    expect(result.headers).toEqual([]);
    expect(result.rows).toHaveLength(3);
    expect(result.rows[0]).toEqual(['First line']);
    expect(result.rows[1]).toEqual(['Second line']);
    expect(result.rows[2]).toEqual(['Third line']);
  });

  it('should handle empty text gracefully', async () => {
    const ingester = new TextIngester();
    const buffer = Buffer.from('', 'utf-8');
    
    const result = await ingester.parse(buffer);
    
    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
  });
});
