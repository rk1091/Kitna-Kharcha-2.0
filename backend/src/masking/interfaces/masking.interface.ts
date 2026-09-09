export enum PIIType {
  ACCOUNT_NUMBER = 'ACCOUNT_NUMBER',
  PAN = 'PAN',
  AADHAAR = 'AADHAAR',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  IFSC = 'IFSC',
  UPI_ID = 'UPI_ID',
  BALANCE = 'BALANCE',
  BENEFICIARY = 'BENEFICIARY',
}

export interface MaskMatch {
  start: number;
  end: number;
  type: PIIType;
  originalText: string;
  maskedText: string;
  confidence: number;
}

export interface MaskingResult {
  maskedText: string;
  report: MaskMatch[];
  overallConfidence: number;
  encryptedMapping?: Record<string, string>;
  flaggedForReview: boolean;
}

export interface MaskingStrategy {
  detectAndMask(text: string): MaskMatch[];
}
