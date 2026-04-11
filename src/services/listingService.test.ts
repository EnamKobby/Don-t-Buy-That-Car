import { describe, it, expect, vi } from 'vitest';
import { fetchLiveListings } from './listingService';

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
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
    return this;
  }
}

vi.stubGlobal('Image', MockImage);

// Mock the GoogleGenAI module
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify([
            {
              title: '2016 Honda Civic',
              price: 10000,
              mileage: 50000,
              year: 2016,
              location: 'London',
              imageUrl: 'https://m.atcdn.co.uk/a/media/abcd1234.jpg',
              sourceSite: 'Auto Trader',
              listingUrl: 'https://www.autotrader.co.uk/car-details/202503040123456',
              adviceSnippet: 'Good car',
              exceedsBudget: false,
              exceedsMileage: false,
            },
            {
              title: 'Invalid Car (No URL)',
              price: 5000,
              mileage: 100000,
              year: 2010,
              location: 'London',
              imageUrl: 'https://m.atcdn.co.uk/a/media/abcd9999.jpg',
              sourceSite: 'Auto Trader',
              listingUrl: 'https://www.autotrader.co.uk/', // Generic URL should be filtered
              adviceSnippet: 'Bad car',
              exceedsBudget: false,
              exceedsMileage: false,
            },
            {
              title: 'Valid URL, missing image',
              price: 9200,
              mileage: 81000,
              year: 2015,
              location: 'Bristol',
              imageUrl: '',
              sourceSite: 'Auto Trader',
              listingUrl: 'https://www.autotrader.co.uk/car-details/202401010000001?fromSavedAds=true',
              adviceSnippet: 'Still valid despite missing image metadata',
              exceedsBudget: false,
              exceedsMileage: false,
            }
          ])
        })
      };
    },
    Type: {
      ARRAY: 'ARRAY',
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      NUMBER: 'NUMBER',
      BOOLEAN: 'BOOLEAN'
    }
  };
});

describe('fetchLiveListings', () => {
  it('should fetch and validate listings, filtering out invalid ones', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    
    const listings = await fetchLiveListings('Honda Civic', 12000);
    
    // Should only return the valid listing
    expect(listings).toHaveLength(2);
    expect(listings[0].title).toBe('2016 Honda Civic');
    expect(listings[0].listingUrl).toBe('https://www.autotrader.co.uk/car-details/202503040123456');
  });
});
