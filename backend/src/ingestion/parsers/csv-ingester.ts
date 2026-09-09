import { Ingester } from '../interfaces/ingester.interface';
import { parse } from 'csv-parse';

export class CSVIngester implements Ingester {
  async parse(buffer: Buffer): Promise<{ headers: string[]; rows: string[][] }> {
    return new Promise((resolve, reject) => {
      const content = buffer.toString('utf-8');
      if (!content.trim()) {
        return resolve({ headers: [], rows: [] });
      }

      parse(content, { relax_column_count: true }, (err, records: string[][]) => {
        if (err) {
          return reject(err);
        }
        
        if (records.length === 0) {
          return resolve({ headers: [], rows: [] });
        }

        const headers = records[0];
        const rows = records.slice(1);
        resolve({ headers, rows });
      });
    });
  }
}
