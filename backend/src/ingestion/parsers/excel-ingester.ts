import { Ingester } from '../interfaces/ingester.interface';
import * as xlsx from 'xlsx';

export class ExcelIngester implements Ingester {
  async parse(buffer: Buffer): Promise<{ headers: string[]; rows: string[][] }> {
    const wb = xlsx.read(buffer, { type: 'buffer' });
    
    if (wb.SheetNames.length === 0) {
      return { headers: [], rows: [] };
    }

    const wsName = wb.SheetNames[0];
    const ws = wb.Sheets[wsName];
    
    const records: string[][] = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false });
    
    if (records.length === 0) {
      return { headers: [], rows: [] };
    }

    const headers = records[0].map(h => String(h));
    const rows = records.slice(1).map(row => row.map(cell => String(cell)));
    
    return { headers, rows };
  }
}
