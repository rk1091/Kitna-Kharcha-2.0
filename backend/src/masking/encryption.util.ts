import * as crypto from 'crypto';

export class EncryptionUtil {
  private static readonly ALGORITHM = 'aes-256-cbc';

  static encrypt(text: string, key: string): string {
    if (Buffer.byteLength(key) !== 32) {
      throw new Error('Key must be exactly 32 bytes for AES-256');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.ALGORITHM, Buffer.from(key), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return iv and encrypted text combined, e.g. iv:encrypted
    return `${iv.toString('hex')}:${encrypted}`;
  }

  static decrypt(encryptedText: string, key: string): string {
    if (Buffer.byteLength(key) !== 32) {
      throw new Error('Key must be exactly 32 bytes for AES-256');
    }

    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];

    const decipher = crypto.createDecipheriv(this.ALGORITHM, Buffer.from(key), iv);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
