import { describe, it, expect, vi } from 'vitest';
import { runPreOutputQC, checkConstraintIntegrity, checkListingValidity, checkVibeConsistency, validateImage } from './qcService';
import { CarListing } from './listingService';

// Mock the Image object for validateImage
const mockImage = {
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  src: '',
};

class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  constructor() {
    mockImage.onload = null;
    mockImage.onerror = null;
    return mockImage;
  }
}

vi.stubGlobal('Image', MockImage);

describe('QC Service', () => {
  const validListing: CarListing = {
    id: '1',
    title: '2016 Honda Civic',
    price: 10000,
    mileage: 50000,
    year: 2016,
    location: 'London',
    imageUrl: 'https://m.atcdn.co.uk/a/media/abcd1234.jpg',
    sourceSite: 'Auto Trader',
    listingUrl: 'https://www.autotrader.co.uk/car-details/202503040123456',
    score: 95,
    confidence: 'HIGH',
    tags: ['Good Deal'],
    passReason: 'Great car',
    exceedsBudget: false,
    exceedsMileage: false,
  };

  describe('checkConstraintIntegrity', () => {
    it('should pass when constraints are met', () => {
      const result = checkConstraintIntegrity(validListing, 12000, 60000);
      expect(result.passed).toBe(true);
    });

    it('should fail when price exceeds budget and not labelled', () => {
      const result = checkConstraintIntegrity(validListing, 8000, 60000);
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('Price 10000 exceeds budget 8000');
    });

    it('should pass when price exceeds budget but is labelled', () => {
      const result = checkConstraintIntegrity({ ...validListing, exceedsBudget: true }, 8000, 60000);
      expect(result.passed).toBe(true);
    });

    it('should fail when mileage exceeds max and not labelled', () => {
      const result = checkConstraintIntegrity(validListing, 12000, 40000);
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('Mileage 50000 exceeds max 40000');
    });
  });

  describe('checkListingValidity', () => {
    it('should pass for a valid specific car URL', () => {
      const result = checkListingValidity(validListing);
      expect(result.passed).toBe(true);
    });

    it('should fail for generic search URLs', () => {
      expect(checkListingValidity({ ...validListing, listingUrl: 'https://www.autotrader.co.uk/car-search' }).passed).toBe(false);
      expect(checkListingValidity({ ...validListing, listingUrl: 'https://www.motors.co.uk/used-cars/' }).passed).toBe(false);
      expect(checkListingValidity({ ...validListing, listingUrl: 'https://example.com/search?q=civic' }).passed).toBe(false);
      expect(checkListingValidity({ ...validListing, listingUrl: 'https://www.autotrader.co.uk/car-details/12345' }).passed).toBe(false);
    });
  });

  describe('checkVibeConsistency', () => {
    it('should pass for a good car', () => {
      const result = checkVibeConsistency(validListing);
      expect(result.passed).toBe(true);
    });

    it('should fail for a suspiciously underpriced car with high mileage', () => {
      // 2016 (10 years old), baseline 5000. 5000 * 0.7 = 3500.
      // Score drops by 20 for price, 10 for mileage. Total score = 70.
      const result = checkVibeConsistency({ ...validListing, price: 3000, mileage: 150000 });
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('Fails vibe check');
    });
  });

  describe('validateImage', () => {
    it('should fail for placeholder URLs', async () => {
      expect(await validateImage('https://example.com/placeholder.png')).toBe(false);
      expect(await validateImage('https://imagin.studio/car.jpg')).toBe(false);
    });

    it('should resolve true when image loads', async () => {
      const promise = validateImage('https://example.com/real-image.jpg');
      setTimeout(() => mockImage.onload && mockImage.onload(), 10);
      expect(await promise).toBe(true);
    });

    it('should resolve false when image fails to load', async () => {
      const promise = validateImage('https://example.com/broken-image.jpg');
      setTimeout(() => mockImage.onerror && mockImage.onerror(), 10);
      expect(await promise).toBe(false);
    });
  });

  describe('runPreOutputQC', () => {
    it('should filter out invalid listings', async () => {
      const listings = [
        validListing,
        { ...validListing, id: '2', price: 15000 }, // Fails budget
        { ...validListing, id: '3', listingUrl: 'https://www.autotrader.co.uk/car-search' }, // Fails URL
      ];

      // Mock validateImage to always pass for this test
      vi.spyOn(global, 'Image').mockImplementation(function() {
        const img = {} as HTMLImageElement;
        setTimeout(() => img.onload && (img.onload as () => void)(), 0);
        return img;
      } as unknown as () => HTMLImageElement);

      const result = await runPreOutputQC(listings, 12000, 60000);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
    });
  });
});
