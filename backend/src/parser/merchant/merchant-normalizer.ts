import { Injectable } from '@nestjs/common';

@Injectable()
export class MerchantNormalizer {
  normalize(rawMerchant: string): string {
    let normalized = rawMerchant.trim();

    // Remove UPI/P2A/xxx/ or UPI/P2M/xxx/
    const upiRegex = /^UPI\/(?:P2A|P2M)\/[\w-]+\/(.*?)(?:\/[\w-]+)?$/i;
    const upiMatch = normalized.match(upiRegex);
    if (upiMatch && upiMatch[1]) {
      normalized = upiMatch[1];
    } else {
      // Remove generic UPI/NEFT/IMPS prefixes with slashes or dashes
      // e.g. UPI/12345/Merchant/Oth -> Merchant
      const genericRegex = /^(?:UPI|NEFT|IMPS)[/-][\w-]+[/-](.*?)(?:[/-][\w-]+)?$/i;
      const genericMatch = normalized.match(genericRegex);
      if (genericMatch && genericMatch[1]) {
        normalized = genericMatch[1];
      }
    }

    return normalized.trim();
  }
}
