import { describe, it, expect } from 'vitest';
import { EncryptionUtil } from './encryption.util';

describe('EncryptionUtil', () => {
  const key = '12345678901234567890123456789012'; // 32 bytes key for AES-256
  const data = 'SensitiveData123';

  it('should encrypt and decrypt data correctly', () => {
    const encrypted = EncryptionUtil.encrypt(data, key);
    expect(encrypted).not.toBe(data);
    expect(typeof encrypted).toBe('string');

    const decrypted = EncryptionUtil.decrypt(encrypted, key);
    expect(decrypted).toBe(data);
  });

  it('should return different encrypted strings for same data due to random IV', () => {
    const encrypted1 = EncryptionUtil.encrypt(data, key);
    const encrypted2 = EncryptionUtil.encrypt(data, key);
    
    expect(encrypted1).not.toBe(encrypted2);
  });

  it('should throw error on invalid key length', () => {
    const invalidKey = 'shortkey';
    expect(() => EncryptionUtil.encrypt(data, invalidKey)).toThrow();
  });
});
