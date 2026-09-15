import { MaskMatch, MaskingStrategy, PIIType } from '../interfaces/masking.interface';

export class AddressPinStrategy implements MaskingStrategy {
  detectAndMask(text: string): MaskMatch[] {
    const matches: MaskMatch[] = [];

    // 1. Explicit PIN Code labels: e.g. "PIN: 560038", "Pin Code 110001", "Postal Code: 400001"
    const explicitPinRegex = /\b(?:PIN|PIN\s*Code|Postal\s*Code|Zip|Zip\s*Code)[\s:]*([1-9][0-9]{5})\b/gi;
    let match: RegExpExecArray | null;

    while ((match = explicitPinRegex.exec(text)) !== null) {
      const pin = match[1];
      const pinIndex = match[0].lastIndexOf(pin);
      matches.push({
        start: match.index + pinIndex,
        end: match.index + pinIndex + pin.length,
        type: PIIType.ADDRESS,
        originalText: pin,
        maskedText: '[PINCODE_REDACTED]',
        confidence: 0.95,
      });
    }

    // 2. Comprehensive Address block with prefixes:
    // "Phase", "Estate", "Sector", "Plot", "Flat", "Apartment", "House", "H.No", "Tower", "Floor", "Building", "Street", "Road", "Nagar", "Colony", "Layout", "Enclave", "Vihar"
    const addressBlockRegex = /\b(?:Flat|Apartment|Apt|Plot|House|H\.?No\.?|Tower|Sector|Phase|Estate|Building|Floor|Street|Road|Nagar|Colony|Layout|Enclave|Vihar)[\s\S]{5,200}?\b[1-9][0-9]{5}\b/gi;
    while ((match = addressBlockRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: PIIType.ADDRESS,
        originalText: match[0],
        maskedText: '[ADDRESS_REDACTED]',
        confidence: 0.90,
      });
    }

    // 3. Indian City followed by 6-digit PIN code
    const cityPinRegex = /\b(?:Mumbai|Delhi|New\s+Delhi|Bangalore|Bengaluru|Kolkata|Chennai|Hyderabad|Pune|Ahmedabad|Gurgaon|Gurugram|Noida|Greater\s+Noida|Jaipur|Lucknow|Chandigarh|Kochi|Indore|Nagpur|Bhopal|Patna|Vadodara|Surat|Ghaziabad)\s*(?:,\s*|\s+)([1-9][0-9]{5})\b/gi;
    while ((match = cityPinRegex.exec(text)) !== null) {
      const pin = match[1];
      const pinIndex = match[0].lastIndexOf(pin);
      matches.push({
        start: match.index + pinIndex,
        end: match.index + pinIndex + pin.length,
        type: PIIType.ADDRESS,
        originalText: pin,
        maskedText: '[PINCODE_REDACTED]',
        confidence: 0.92,
      });
    }

    return matches;
  }
}
