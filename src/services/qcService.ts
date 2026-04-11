import { CarListing } from './listingService';
import { logger } from '../utils/logger';

export interface QCResult {
  passed: boolean;
  reason?: string;
}

export async function validateImage(url: string): Promise<boolean> {
  if (!url || url.includes('placeholder') || url.includes('imagin.studio') || url.includes('logo')) {
    return false;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => resolve(false), 2500);
    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    img.src = url;
  });
}

export function checkConstraintIntegrity(listing: CarListing, budget: number, maxMileage?: number): QCResult {
  // Check budget
  if (listing.price > budget && !listing.exceedsBudget) {
    return { passed: false, reason: `Price ${listing.price} exceeds budget ${budget} but not labelled` };
  }

  // Check mileage
  if (maxMileage && listing.mileage > maxMileage && !listing.exceedsMileage) {
    return { passed: false, reason: `Mileage ${listing.mileage} exceeds max ${maxMileage} but not labelled` };
  }

  return { passed: true };
}

export function checkListingValidity(listing: CarListing): QCResult {
  const url = listing.listingUrl?.toLowerCase() || '';
  const canonicalAutotraderListing = /^https:\/\/(www\.)?autotrader\.co\.uk\/car-details\/\d{12,16}$/i;
  
  if (!url || 
      url === 'https://www.autotrader.co.uk/' ||
      url === 'https://www.motors.co.uk/' ||
      url.includes('/car-search') || 
      url.includes('/used-cars/') ||
      url.includes('search?') ||
      url.includes('?')
  ) {
    return { passed: false, reason: 'Generic search link' };
  }

  if (url.includes('autotrader.co.uk') && !canonicalAutotraderListing.test(url)) {
    return { passed: false, reason: 'Not a canonical AutoTrader car detail page' };
  }

  return { passed: true };
}

export function checkVibeConsistency(listing: CarListing): QCResult {
  let score = 100;
  
  const age = new Date().getFullYear() - listing.year;
  
  // Basic baseline estimation
  let baselineMin = 5000;
  if (age < 5) baselineMin = 10000;
  if (age < 3) baselineMin = 15000;

  if (listing.price < baselineMin * 0.7) {
    score -= 20; // Suspiciously underpriced
  }

  if (listing.mileage > 100000) {
    score -= 10;
  }
  
  if (age > 8 && listing.mileage < 20000) {
    score -= 5;
  }

  // If score drops below 80, it's a CAUTION or WALK AWAY
  if (score < 80) {
    return { passed: false, reason: `Fails vibe check (score ${score})` };
  }

  return { passed: true };
}

export function validateConfidence(listing: CarListing): CarListing {
  let newConfidence = listing.confidence;

  // Decrease confidence if data is missing or generic
  const isMissingData = 
    !listing.location || 
    listing.location.toLowerCase() === 'unknown' ||
    !listing.sourceSite ||
    listing.sourceSite.toLowerCase() === 'unknown';

  if (isMissingData && newConfidence === 'HIGH') {
    newConfidence = 'MEDIUM';
    logger.warn('QC: Downgraded confidence due to missing/generic data', { listingId: listing.id });
  }

  // Never have HIGH confidence if it's an older car with very low mileage (suspicious)
  const age = new Date().getFullYear() - listing.year;
  if (age > 10 && listing.mileage < 30000 && newConfidence === 'HIGH') {
    newConfidence = 'MEDIUM';
    logger.warn('QC: Downgraded confidence due to suspicious age/mileage ratio', { listingId: listing.id });
  }

  return { ...listing, confidence: newConfidence };
}

export async function runPreOutputQC(listings: CarListing[], budget: number, maxMileage?: number): Promise<CarListing[]> {
  const checks = listings.map(async (listing) => {
    try {
      // 1. Constraint Integrity
      const constraintCheck = checkConstraintIntegrity(listing, budget, maxMileage);
      if (!constraintCheck.passed) {
        logger.warn('QC Failed: Constraint Integrity', { listing: listing.title, reason: constraintCheck.reason });
        return null;
      }

      // 2. Listing Validity (URL format)
      const validityCheck = checkListingValidity(listing);
      if (!validityCheck.passed) {
        logger.warn('QC Failed: Listing Validity', { listing: listing.title, reason: validityCheck.reason });
        return null;
      }

      // 3. Image Validation (advisory only - do not drop otherwise good listings)
      const isImageValid = await validateImage(listing.imageUrl);
      if (!isImageValid) {
        logger.warn('QC Failed: Image Validation', { listing: listing.title, reason: 'Image failed to load or is placeholder' });
        return null;
      }

      // 4. Vibe Check Consistency
      const vibeCheck = checkVibeConsistency(listing);
      if (!vibeCheck.passed) {
        logger.warn('QC Failed: Vibe Check', { listing: listing.title, reason: vibeCheck.reason });
        return null;
      }

      // 5. Confidence System Validation
      return validateConfidence(listing);
    } catch (error) {
      logger.error('Error during QC check', error, { listing: listing.title });
      return null;
    }
  });

  const results = await Promise.all(checks);
  return results.filter((listing): listing is CarListing => listing !== null);
}
