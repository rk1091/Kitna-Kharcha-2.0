export interface Ingester {
  parse(buffer: Buffer): Promise<{ headers: string[]; rows: string[][] }>;
}
