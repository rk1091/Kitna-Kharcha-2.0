import { Injectable } from '@nestjs/common';

interface CanonicalMerchantRule {
  pattern: RegExp;
  canonicalName: string;
}

@Injectable()
export class MerchantNormalizer {
  private readonly canonicalRules: CanonicalMerchantRule[] = [
    // Food & Quick Commerce
    { pattern: /\b(SWIGGY|BUNDL\s+TECH(?:NOLOGIES)?)\b/i, canonicalName: 'Swiggy' },
    { pattern: /\b(ZOMATO|HYPERPURE)\b/i, canonicalName: 'Zomato' },
    { pattern: /\b(BLINKIT|GROFERS)\b/i, canonicalName: 'Blinkit' },
    { pattern: /\b(ZEPTO)\b/i, canonicalName: 'Zepto' },

    // E-Commerce & Retail
    { pattern: /\b(AMAZON|AMZN)\b/i, canonicalName: 'Amazon' },
    { pattern: /\b(FLIPKART)\b/i, canonicalName: 'Flipkart' },

    // Mobility & Travel
    { pattern: /\b(UBER)\b/i, canonicalName: 'Uber' },
    { pattern: /\b(OLA\s+CABS|ANI\s+TECH(?:NOLOGIES)?|\bOLA\b)/i, canonicalName: 'Ola' },
    { pattern: /\b(MAKEMYTRIP|MMT)\b/i, canonicalName: 'MakeMyTrip' },
    { pattern: /\b(IRCTC)\b/i, canonicalName: 'Irctc' },

    // Streaming, Entertainment & Tech
    { pattern: /\b(NETFLIX|NFLX)\b/i, canonicalName: 'Netflix' },
    { pattern: /\b(SPOTIFY)\b/i, canonicalName: 'Spotify' },
    { pattern: /\b(HOTSTAR|DISNEY)\b/i, canonicalName: 'Disney+ Hotstar' },
    { pattern: /\b(GOOGLE\s+PLAY)\b/i, canonicalName: 'Google Play' },
    { pattern: /\b(APPLE\.COM|APPLE\s+SERVICES|ITUNES)\b/i, canonicalName: 'Apple' },

    // Fintech & Investments
    { pattern: /\b(ZERODHA)\b/i, canonicalName: 'Zerodha' },
    { pattern: /\b(GROWW)\b/i, canonicalName: 'Groww' },
    { pattern: /\b(CRED)\b/i, canonicalName: 'Cred' },

    // Telecom
    { pattern: /\b(BHARTI\s+AIRTEL|AIRTEL)\b/i, canonicalName: 'Airtel' },
    { pattern: /\b(RELIANCE\s+JIO|JIO\s+INFOCOMM|\bJIO\b)/i, canonicalName: 'Jio' },
    { pattern: /\b(VODAFONE\s+IDEA|\bVI\b)\b/i, canonicalName: 'Vi' },

    // Utilities & Power
    { pattern: /\b(TATA\s+POWER)\b/i, canonicalName: 'Tata Power' },
    { pattern: /\b(BESCOM)\b/i, canonicalName: 'Bescom' },
  ];

  // Primary substring dictionary: If keyword is anywhere in text, match immediately
  private readonly substringDictionary: Array<{ keyword: string; canonicalName: string }> = [
    { keyword: 'swiggy', canonicalName: 'Swiggy' },
    { keyword: 'zomato', canonicalName: 'Zomato' },
    { keyword: 'dineout', canonicalName: 'Dineout' },
    { keyword: 'nykaa', canonicalName: 'Nykaa' },
    { keyword: 'blinkit', canonicalName: 'Blinkit' },
    { keyword: 'grofers', canonicalName: 'Blinkit' },
    { keyword: 'zepto', canonicalName: 'Zepto' },
    { keyword: 'amazon', canonicalName: 'Amazon' },
    { keyword: 'amzn', canonicalName: 'Amazon' },
    { keyword: 'flipkart', canonicalName: 'Flipkart' },
    { keyword: 'myntra', canonicalName: 'Myntra' },
    { keyword: 'ajio', canonicalName: 'Ajio' },
    { keyword: 'uber', canonicalName: 'Uber' },
    { keyword: 'makemytrip', canonicalName: 'MakeMyTrip' },
    { keyword: 'irctc', canonicalName: 'Irctc' },
    { keyword: 'netflix', canonicalName: 'Netflix' },
    { keyword: 'spotify', canonicalName: 'Spotify' },
    { keyword: 'hotstar', canonicalName: 'Disney+ Hotstar' },
    { keyword: 'google play', canonicalName: 'Google Play' },
    { keyword: 'zerodha', canonicalName: 'Zerodha' },
    { keyword: 'groww', canonicalName: 'Groww' },
    { keyword: 'cred', canonicalName: 'Cred' },
    { keyword: 'airtel', canonicalName: 'Airtel' },
    { keyword: 'tata power', canonicalName: 'Tata Power' },
    { keyword: 'bescom', canonicalName: 'Bescom' },
  ];

  // Locations / state codes to strip from trailing parts of narrative
  private readonly locationSuffixRegex =
    /\s+(?:(?:NEW\s+DELHI|DELHI|MUMBAI|BANGALORE|BENGALURU|HYDERABAD|CHENNAI|PUNE|KOLKATA|NOIDA|GURGAON|GURUGRAM|AHMEDABAD)(?:\s+(?:IN|KA|MH|DL|TN|TS|UP|GJ))?|IN|KA|MH|DL|TN|TS|UP|GJ)$/i;

  // Gateways and aggregators to strip
  private readonly gatewayRegex =
    /(?:\/(?:RAZORPAY|RAZ|PAYU|BILLDESK|CCAVENUE|CASHFREE)(?:\/[\w-]+)*|\b(?:PAYU|CCAVENUE|CASHFREE|RAZORPAY|RAZ)\*)/gi;

  normalize(rawMerchant?: string | null): string {
    if (!rawMerchant || typeof rawMerchant !== 'string') {
      return '';
    }

    let text = rawMerchant.trim();
    if (!text) return '';

    // Step 0: Check fast substring containment first (case-insensitive)
    const lowerRaw = text.toLowerCase();
    for (const entry of this.substringDictionary) {
      if (lowerRaw.includes(entry.keyword)) {
        return entry.canonicalName;
      }
    }

    // Handle VPA/handle format (e.g. swiggy@hdfcbank -> swiggy, zomato.order@icici -> zomato order)
    if (/^[\w.-]+@[a-zA-Z]+$/.test(text)) {
      text = text.split('@')[0].replace(/[._-]+/g, ' ');
    }

    // Strip leading time / timestamp noise (e.g. "19:14:00:", "00:00:00:", "00:", "0:")
    text = text.replace(/^\s*(?:\d{1,2}:)?\d{1,2}(?::\d{1,2})?\s*:?\s*/, '').trim();

    // Strip leading punctuation (colons, dashes, slashes, asterisks)
    text = text.replace(/^[:\-\/*\s]+/, '').trim();

    // Strip EMI prefixes (e.g. "EMINYKAA" -> "NYKAA", "EMI NYKAA" -> "NYKAA")
    text = text.replace(/^EMI\s*(?=[A-Za-z])/i, '').trim();

    // Strip website wrappers (e.g. "WWW DINEOUT CO IN" -> "DINEOUT")
    text = text.replace(/^WWW\s+(.*?)\s+(?:CO\s+IN|COM|IN)\b/i, '$1').trim();

    // Strip SmartBuy aggregator
    text = text.replace(/\bVIA\s+SMARTBUY(?:\w+)?/gi, '').trim();

    // Strip M/s honorific prefix early to prevent slash splitting errors
    text = text.replace(/\bM\/[sS][.\s/-]*/gi, '').trim();

    // Strip payment rail prefixes and routing data
    text = this.stripPaymentRailPrefixes(text);

    // Strip payment gateways / aggregators
    text = text.replace(this.gatewayRegex, ' ').trim();

    // Re-check substring dictionary after stripping rail prefixes
    const lowerCleaned = text.toLowerCase();
    for (const entry of this.substringDictionary) {
      if (lowerCleaned.includes(entry.keyword)) {
        return entry.canonicalName;
      }
    }

    // Check canonical alias dictionary
    for (const rule of this.canonicalRules) {
      if (rule.pattern.test(text)) {
        return rule.canonicalName;
      }
    }

    // Strip trailing credit/debit indicators (e.g. " C", " D")
    text = text.replace(/\s+[CD]$/i, '').trim();

    // Strip location suffixes
    text = text.replace(this.locationSuffixRegex, '').trim();

    // Strip corporate entity suffixes
    text = text
      .replace(
        /\s+(?:PVT\.?\s*LTD\.?|PRIVATE\s+LIMITED|LTD\.?|LIMITED|LLP|INC\.?|CORP\.?)\b/gi,
        '',
      )
      .trim();

    // Collapse whitespace and apply Title Case
    text = text.replace(/\s+/g, ' ').trim();
    return this.toTitleCase(text);
  }

  private stripPaymentRailPrefixes(input: string): string {
    let s = input;

    // NEFT / RTGS with IFSC: e.g. NEFT CR-HDFC0000001-ZERODHA BROKING LTD or RTGS DR-SBIN0001234-TATA POWER
    const ifscRegex = /^(?:NEFT|RTGS|IMPS)\s+(?:CR|DR)-[A-Z]{4}\w+-(.*?)$/i;
    const ifscMatch = s.match(ifscRegex);
    if (ifscMatch && ifscMatch[1]) {
      return ifscMatch[1].trim();
    }

    // UPI prefixes (UPI/P2M/..., UPI/P2A/..., UPI/12345/..., UPI-12345-...)
    if (/^UPI[/-]/i.test(s)) {
      const parts = s.split(/[/-]/).map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 3) {
        if (/^(P2A|P2M|CR|DR)$/i.test(parts[1])) {
          // Format: UPI / P2M / REF / MERCHANT [/ EXTRA...]
          if (parts.length >= 4) {
            return parts[3];
          }
        } else {
          // Format: UPI / REF / MERCHANT [/ EXTRA...]
          return parts[2];
        }
      }
    }

    // Generic IMPS / NEFT / RTGS: e.g. IMPS-12345-Airtel, NEFT-12345-Reliance, IMPS/0987/Jio
    if (/^(?:IMPS|NEFT|RTGS)[/-]/i.test(s)) {
      const parts = s.split(/[/-]/).map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 3) {
        return parts[2];
      }
    }

    // Card / POS transactions: POS 4012XXXXXXXX1234 STARBUCKS COFFEE NEW DELHI IN
    const posRegex = /^POS\s+(?:(?:\d{4,6}X+\d{4})|\d+)\s+(.*?)$/i;
    const posMatch = s.match(posRegex);
    if (posMatch && posMatch[1]) {
      return posMatch[1].trim();
    }

    // POS slash format: POS/412345XXXXXX1234/BLUE TOKAI/MUMBAI
    const posSlashRegex = /^POS\/(?:(?:\d{4,6}X+\d{4})|\d+)\/(.*?)(?:\/[^/]+)*$/i;
    const posSlashMatch = s.match(posSlashRegex);
    if (posSlashMatch && posSlashMatch[1]) {
      return posSlashMatch[1].trim();
    }

    // ECOM PUR: ECOM PUR/AMAZON PAY INDIA/4012XXXXXXXX1234/BANGALORE
    const ecomRegex = /^ECOM\s+PUR\/(.*?)(?:\/(?:(?:\d{4,6}X+\d{4})|\d+))?(?:\/[^/]+)*$/i;
    const ecomMatch = s.match(ecomRegex);
    if (ecomMatch && ecomMatch[1]) {
      return ecomMatch[1].trim();
    }

    // Mandates: ACH, NACH, Standing Instructions
    const achRegex = /^(?:ACH|NACH)\s+(?:CR|DR|D)-?\s*(.*?)$/i;
    const achMatch = s.match(achRegex);
    if (achMatch && achMatch[1]) {
      return achMatch[1].trim();
    }

    const nachSlashRegex = /^(?:ACH|NACH)\/(.*?)(?:\/\w+)*$/i;
    const nachSlashMatch = s.match(nachSlashRegex);
    if (nachSlashMatch && nachSlashMatch[1]) {
      return nachSlashMatch[1].trim();
    }

    const siRegex = /^SI-(.*?)(?:-\d+)?$/i;
    const siMatch = s.match(siRegex);
    if (siMatch && siMatch[1]) {
      return siMatch[1].trim();
    }

    // BBPS / BillDesk utilities
    const bbpsSlashRegex = /^BBPS\/BILLDESK\/(.*?)(?:\/[^/]+)*$/i;
    const bbpsSlashMatch = s.match(bbpsSlashRegex);
    if (bbpsSlashMatch && bbpsSlashMatch[1]) {
      return bbpsSlashMatch[1].trim();
    }

    const bbpsDashRegex = /^BBPS-(.*?)(?:-\d+)?$/i;
    const bbpsDashMatch = s.match(bbpsDashRegex);
    if (bbpsDashMatch && bbpsDashMatch[1]) {
      return bbpsDashMatch[1].trim();
    }

    const billdeskRegex = /^BILLDESK\*(.*?)(?:_[\w]+)?$/i;
    const billdeskMatch = s.match(billdeskRegex);
    if (billdeskMatch && billdeskMatch[1]) {
      return billdeskMatch[1].trim();
    }

    return s;
  }

  private toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
