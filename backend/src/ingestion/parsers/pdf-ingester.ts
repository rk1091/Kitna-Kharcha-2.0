import { Ingester } from '../interfaces/ingester.interface';
const pdf = require('pdf-parse');

export class PDFIngester implements Ingester {
  async parse(buffer: Buffer): Promise<{ headers: string[]; rows: string[][] }> {
    try {
      const data = await pdf(buffer);
      const content = data.text;
      
      if (!content || !content.trim()) {
        return { headers: [], rows: [] };
      }

      const lines = content.split(/\r?\n/);
      const rows = lines.map((line: string) => [line]);

      return { headers: [], rows };
    } catch (error) {
      throw new Error('Failed to parse PDF: ' + (error as Error).message);
    }
  }
}

