import { z } from 'zod';
import { logger } from './logger';

export const CarListingSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  price: z.number().positive(),
  mileage: z.number().nonnegative(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  location: z.string().min(1),
  imageUrl: z.string().refine((value) => value === '' || z.string().url().safeParse(value).success, {
    message: 'Must be a valid URL or an empty string',
  }),
  sourceSite: z.string().min(1),
  listingUrl: z.string().url().refine((value) => {
    try {
      const parsed = new URL(value);
      const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
      return host === 'autotrader.co.uk' && /^\/car-details\/\d{8,20}$/i.test(parsed.pathname);
    } catch {
      return false;
    }
  }, {
    message: 'listingUrl must be an Auto Trader car detail URL',
  }),
  score: z.number().min(0).max(100),
  confidence: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  tags: z.array(z.string()),
  passReason: z.string(),
  exceedsBudget: z.boolean().optional(),
  exceedsMileage: z.boolean().optional(),
  tradeoffAdvice: z.string().optional(),
  timeOnMarket: z.string().optional(),
  timeOnMarketConfidence: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  timeOnMarketContext: z.string().optional(),
});

export type ValidatedCarListing = z.infer<typeof CarListingSchema>;

/**
 * Validates a single car listing.
 * Returns the validated listing or null if invalid.
 */
export function validateListing(data: unknown): ValidatedCarListing | null {
  try {
    return CarListingSchema.parse(data);
  } catch (error) {
    logger.warn('Listing validation failed', { data }, error);
    return null;
  }
}

/**
 * Validates an array of car listings, filtering out invalid ones.
 */
export function validateListings(data: unknown[]): ValidatedCarListing[] {
  return data
    .map(item => validateListing(item))
    .filter((item): item is ValidatedCarListing => item !== null);
}
