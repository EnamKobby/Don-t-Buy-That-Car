import { describe, it, expect } from 'vitest';
import { validateListing, validateListings } from './validation';

describe('Validation Layer', () => {
  const validListing = {
    id: '123',
    title: '2016 Honda Civic',
    price: 10000,
    mileage: 50000,
    year: 2016,
    location: 'London',
    imageUrl: 'https://example.com/image.jpg',
    sourceSite: 'Auto Trader',
    listingUrl: 'https://example.com/car-details/123',
    score: 95,
    confidence: 'HIGH',
    tags: ['Good Deal'],
    passReason: 'Great car',
  };

  it('should validate a correct listing', () => {
    const result = validateListing(validListing);
    expect(result).not.toBeNull();
    expect(result?.title).toBe('2016 Honda Civic');
  });

  it('should reject a listing with missing required fields', () => {
    const invalidListing = { ...validListing, price: undefined };
    const result = validateListing(invalidListing);
    expect(result).toBeNull();
  });

  it('should reject a listing with invalid URL', () => {
    const invalidListing = { ...validListing, listingUrl: 'not-a-url' };
    const result = validateListing(invalidListing);
    expect(result).toBeNull();
  });

  it('should reject a listing with negative price', () => {
    const invalidListing = { ...validListing, price: -100 };
    const result = validateListing(invalidListing);
    expect(result).toBeNull();
  });

  it('should filter out invalid listings from an array', () => {
    const invalidListing = { ...validListing, price: -100 };
    const results = validateListings([validListing, invalidListing]);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('123');
  });
});
