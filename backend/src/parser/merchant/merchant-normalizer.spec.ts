import { describe, it, expect, beforeEach } from 'vitest';
import { MerchantNormalizer } from './merchant-normalizer';

describe('MerchantNormalizer', () => {
  let normalizer: MerchantNormalizer;

  beforeEach(() => {
    normalizer = new MerchantNormalizer();
  });

  describe('Basic & Passthrough', () => {
    it('should return original cleaned name if already canonical', () => {
      expect(normalizer.normalize('Amazon')).toBe('Amazon');
      expect(normalizer.normalize('Swiggy')).toBe('Swiggy');
    });

    it('should handle empty, null, or whitespace-only inputs gracefully', () => {
      expect(normalizer.normalize('')).toBe('');
      expect(normalizer.normalize('   ')).toBe('');
      expect(normalizer.normalize(null as unknown as string)).toBe('');
      expect(normalizer.normalize(undefined as unknown as string)).toBe('');
    });

    it('should trim leading, trailing, and excessive internal whitespace', () => {
      expect(normalizer.normalize('   Starbucks    Coffee   ')).toBe('Starbucks Coffee');
    });
  });

  describe('UPI Rail Normalization', () => {
    it('should strip UPI P2A and P2M prefixes with bank references', () => {
      expect(normalizer.normalize('UPI/P2A/12345/M/s Zomato')).toBe('Zomato');
      expect(normalizer.normalize('UPI/P2M/9876/Swiggy/HDFC')).toBe('Swiggy');
      expect(normalizer.normalize('UPI-12345-Uber')).toBe('Uber');
      expect(normalizer.normalize('UPI/1234567890/Zomato/Oth')).toBe('Zomato');
      expect(normalizer.normalize('UPI/CR/42918294/BLINKIT/PYTM')).toBe('Blinkit');
    });

    it('should handle UPI merchant handles / VPA tails', () => {
      expect(normalizer.normalize('swiggy@hdfcbank')).toBe('Swiggy');
      expect(normalizer.normalize('zomato.order@icici')).toBe('Zomato');
      expect(normalizer.normalize('uber.india@axisbank')).toBe('Uber');
    });
  });

  describe('Card, POS & E-Commerce Transactions', () => {
    it('should strip POS prefix and masked card numbers with location tags', () => {
      expect(normalizer.normalize('POS 4012XXXXXXXX1234 STARBUCKS COFFEE NEW DELHI IN')).toBe('Starbucks Coffee');
      expect(normalizer.normalize('POS/412345XXXXXX1234/BLUE TOKAI/MUMBAI')).toBe('Blue Tokai');
    });

    it('should strip ECOM PUR / E-Commerce prefixes and metadata', () => {
      expect(normalizer.normalize('ECOM PUR/AMAZON PAY INDIA/4012XXXXXXXX1234/BANGALORE')).toBe('Amazon');
      expect(normalizer.normalize('ECOM PUR/FLIPKART INTERNET/BANGALORE')).toBe('Flipkart');
    });
  });

  describe('Netbanking, Transfers & Mandates', () => {
    it('should strip NEFT, RTGS, and IMPS channel noise and IFSC codes', () => {
      expect(normalizer.normalize('NEFT CR-HDFC0000001-ZERODHA BROKING LTD')).toBe('Zerodha');
      expect(normalizer.normalize('NEFT-12345-Reliance Industries')).toBe('Reliance Industries');
      expect(normalizer.normalize('IMPS-12345-Airtel')).toBe('Airtel');
      expect(normalizer.normalize('IMPS/0987/Jio')).toBe('Jio');
      expect(normalizer.normalize('RTGS DR-SBIN0001234-TATA POWER')).toBe('Tata Power');
    });

    it('should strip ACH, NACH, and Standing Instruction (SI) recurring prefixes', () => {
      expect(normalizer.normalize('ACH D- NETFLIX ENTERTAINMENT SERVICES')).toBe('Netflix');
      expect(normalizer.normalize('NACH/SPOTIFY INDIA/12345')).toBe('Spotify');
      expect(normalizer.normalize('SI-HOTSTAR DISNEY-1234')).toBe('Disney+ Hotstar');
    });
  });

  describe('BillDesk & BBPS Utilities', () => {
    it('should normalize BBPS and BillDesk utility narratives', () => {
      expect(normalizer.normalize('BBPS/BILLDESK/TATA POWER/MUMBAI')).toBe('Tata Power');
      expect(normalizer.normalize('BBPS-AIRTEL-123456789')).toBe('Airtel');
      expect(normalizer.normalize('BILLDESK*BESCOM_BLR')).toBe('Bescom');
    });
  });

  describe('Payment Gateway & Aggregator Stripping', () => {
    it('should strip gateway suffixes and prefixes like Razorpay, PayU, Cashfree, CCAvenue', () => {
      expect(normalizer.normalize('UPI/P2M/123456/SWIGGY/RAZORPAY/0928')).toBe('Swiggy');
      expect(normalizer.normalize('PAYU*ZOMATO')).toBe('Zomato');
      expect(normalizer.normalize('CCAVENUE*MAKEMYTRIP')).toBe('MakeMyTrip');
      expect(normalizer.normalize('CASHFREE*CRED')).toBe('Cred');
    });
  });

  describe('Canonical Indian & Global Brand Aliases', () => {
    it('should map food delivery and quick commerce entities to canonical brands', () => {
      expect(normalizer.normalize('SWIGGY INSTAMART')).toBe('Swiggy');
      expect(normalizer.normalize('BUNDL TECHNOLOGIES PVT LTD')).toBe('Swiggy');
      expect(normalizer.normalize('ZOMATO LIMITED')).toBe('Zomato');
      expect(normalizer.normalize('ZOMATO HYPERPURE')).toBe('Zomato');
      expect(normalizer.normalize('BLINKIT COMMERCE PRIVATE LIMITED')).toBe('Blinkit');
      expect(normalizer.normalize('GROFERS INDIA')).toBe('Blinkit');
      expect(normalizer.normalize('ZEPTO QUICK COMMERCE')).toBe('Zepto');
    });

    it('should map e-commerce and ride hailing brands', () => {
      expect(normalizer.normalize('AMZN MKTP IN')).toBe('Amazon');
      expect(normalizer.normalize('AMAZON SELLER SERVICES')).toBe('Amazon');
      expect(normalizer.normalize('FLIPKART INTERNET PVT LTD')).toBe('Flipkart');
      expect(normalizer.normalize('UBER *TRIP 1234 BANGALORE')).toBe('Uber');
      expect(normalizer.normalize('ANI TECHNOLOGIES')).toBe('Ola');
      expect(normalizer.normalize('OLA CABS')).toBe('Ola');
    });

    it('should map subscriptions, entertainment, and tech brands', () => {
      expect(normalizer.normalize('NETFLIX.COM')).toBe('Netflix');
      expect(normalizer.normalize('SPOTIFY AB')).toBe('Spotify');
      expect(normalizer.normalize('GOOGLE PLAY APPS')).toBe('Google Play');
      expect(normalizer.normalize('APPLE.COM/BILL')).toBe('Apple');
    });

    it('should map investment, fintech, and travel brands', () => {
      expect(normalizer.normalize('ZERODHA BROKING')).toBe('Zerodha');
      expect(normalizer.normalize('GROWW INVEST TECH')).toBe('Groww');
      expect(normalizer.normalize('IRCTC WEB TICKETING')).toBe('Irctc');
      expect(normalizer.normalize('MAKEMYTRIP INDIA PVT LTD')).toBe('MakeMyTrip');
    });

    it('should map telecom providers', () => {
      expect(normalizer.normalize('BHARTI AIRTEL LTD')).toBe('Airtel');
      expect(normalizer.normalize('RELIANCE JIO INFOCOMM')).toBe('Jio');
      expect(normalizer.normalize('VODAFONE IDEA LIMITED')).toBe('Vi');
    });
  });

  describe('Corporate Suffixes & Title Casing', () => {
    it('should strip corporate legal entity suffixes (Pvt Ltd, LLC, Inc, etc.)', () => {
      expect(normalizer.normalize('Blue Tokai Coffee Roasters Pvt Ltd')).toBe('Blue Tokai Coffee Roasters');
      expect(normalizer.normalize('Third Wave Coffee LLP')).toBe('Third Wave Coffee');
      expect(normalizer.normalize('Urban Company Ltd')).toBe('Urban Company');
    });

    it('should format unaliased names into clean Title Case', () => {
      expect(normalizer.normalize('APOLLO PHARMACY')).toBe('Apollo Pharmacy');
      expect(normalizer.normalize('chai point indiranagar')).toBe('Chai Point Indiranagar');
    });
  });

  describe('Noisy Bank Formats & Substring Matching', () => {
    it('should recognize Swiggy even with colons, gateways, and attached city names', () => {
      expect(normalizer.normalize(': RAZ*SwiggyBangalore C')).toBe('Swiggy');
    });

    it('should recognize Dineout with website domain wrappers', () => {
      expect(normalizer.normalize(': WWW DINEOUT CO INGURGAON C')).toBe('Dineout');
    });

    it('should recognize Nykaa with timestamps, EMI prefixes, and SmartBuy aggregators', () => {
      expect(normalizer.normalize('00: EMINYKAA VIA SMARTBUYMUMBRA C')).toBe('Nykaa');
    });
  });
});
