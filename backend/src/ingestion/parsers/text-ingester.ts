import { Ingester } from '../interfaces/ingester.interface';

export class TextIngester implements Ingester {
  async parse(buffer: Buffer): Promise<{ headers: string[]; rows: string[][] }> {
    const content = buffer.toString('utf-8');
    if (!content.trim()) {
      return { headers: [], rows: [] };
    }

    const lines = content.split(/\r?\n/);
    const rows = lines.map(line => [line]);

    return { headers: [], rows };
  }
}
