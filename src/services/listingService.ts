import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { logger } from "../utils/logger";
import { validateListings, ValidatedCarListing } from "../utils/validation";
import { runPreOutputQC } from "./qcService";

export type CarListing = ValidatedCarListing;

// In-memory blacklist for the current session (Shadow Mode Audit)
const sessionBlacklist = new Set<string>();

// Simple cache for fetchLiveListings
const listingsCache = new Map<string, { data: CarListing[], timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const AUTOTRADER_DETAIL_REGEX = /^https:\/\/(www\.)?autotrader\.co\.uk\/car-details\/\d{12,16}$/i;
const AUTOTRADER_IMAGE_HOST_REGEX = /^https?:\/\/([a-z0-9-]+\.)*(atcdn\.co\.uk|autotrader\.co\.uk)\//i;

export function addToBlacklist(listingUrl: string) {
  sessionBlacklist.add(listingUrl);
  logger.info('Post-Output Audit: Added listing to blacklist', { listingUrl });
}

function isValidListingUrl(url: string, imageUrl: string): boolean {
  if (sessionBlacklist.has(url)) {
    return false;
  }

  if (!url ||
      url.includes('/car-search') ||
      url.includes('/used-cars/') ||
      url.includes('search?') ||
      url.includes('?') // Reject filter parameters
  ) {
    return false;
  }

  // ONLY accept canonical Auto Trader /car-details/<id>
  if (!AUTOTRADER_DETAIL_REGEX.test(url)) {
    return false;
  }

  if (
    !imageUrl ||
    imageUrl.includes('placeholder') ||
    imageUrl.includes('imagin.studio') ||
    imageUrl.includes('logo')
  ) {
    return false;
  }

  if (!AUTOTRADER_IMAGE_HOST_REGEX.test(imageUrl)) {
    return false;
  }

  return true;
}

export async function fetchLiveListings(query: string, budget: number, originalChoice?: string, maxMileage?: number): Promise<CarListing[]> {
  const cacheKey = `${query}-${budget}-${originalChoice}-${maxMileage}`;
  const cached = listingsCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    logger.info('Returning cached listings', { query, budget });
    return cached.data;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an expert UK car buyer. Your task is to find REAL, CURRENTLY AVAILABLE used car listings in the UK that match the user's criteria.
User wants: "${query}" (or "${originalChoice || query}") around £${budget}${maxMileage ? ` and under ${maxMileage} miles` : ''}.

CRITICAL INSTRUCTIONS:
1. You MUST use Google Search to find specific, real car listings. HINT: Search for "used ${query} site:autotrader.co.uk/car-details/".
2. DO NOT return generic search pages or homepages. You MUST return the specific vehicle detail page URL.
   - The URL MUST contain "autotrader.co.uk/car-details/" and MUST NOT contain query parameters like "?".
3. You MUST extract a real image URL of the specific car hosted by Auto Trader CDN (e.g. https://m.atcdn.co.uk/... or https://images.atcdn.co.uk/...). DO NOT use placeholders or generic logos.
4. Verify the price, mileage, and year from the listing.
5. Estimate Time on Market: Look for "Listed X days ago", "Added on [date]", JSON-LD, or embedded timestamps. If not found, estimate based on cache/search history.
6. Constraint Validation: If the listing exceeds the budget of £${budget}, set exceedsBudget to true. If it has high mileage (>100k), set exceedsMileage to true.
7. Provide tradeoffAdvice if constraints are broken (e.g., "You are £1,500 short OR need to accept ~120k mileage to access this model.").
8. Provide a short 'adviceSnippet' explaining why this specific car is a good choice.
9. URL format is mandatory: https://www.autotrader.co.uk/car-details/<NUMERIC_ID>. Do not output anything else.

Return EXACTLY 5 valid listings. We need 5 to ensure we have enough options after strict filtering.`;

    const generatePromise = ai.models.generateContent({
      model: "gemini-3-flash-preview", // Use flash to avoid quota limits and increase speed
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "e.g. 2016 Honda Civic 1.8 i-VTEC" },
              price: { type: Type.NUMBER },
              mileage: { type: Type.NUMBER },
              year: { type: Type.NUMBER },
              location: { type: Type.STRING },
              imageUrl: { type: Type.STRING, description: "MUST be a real image URL from the listing. No placeholders." },
              sourceSite: { type: Type.STRING, description: "MUST be Auto Trader" },
              listingUrl: { type: Type.STRING, description: "MUST be a specific car detail page URL on Auto Trader. No generic search links." },
              adviceSnippet: { type: Type.STRING },
              exceedsBudget: { type: Type.BOOLEAN },
              exceedsMileage: { type: Type.BOOLEAN },
              tradeoffAdvice: { type: Type.STRING },
              timeOnMarket: { type: Type.STRING, description: "e.g. 'Listed 3 days ago', 'On market for ~2 weeks', 'Recently listed', 'On market for a while'" },
              timeOnMarketConfidence: { type: Type.STRING, description: "HIGH (exact date), MEDIUM (inferred), LOW (estimated)" },
              timeOnMarketContext: { type: Type.STRING, description: "e.g. 'Recently listed — strong listings like this tend to sell quickly' or 'Has been on the market for a while — could be overpriced or less desirable'" }
            },
            required: ["title", "price", "mileage", "year", "location", "imageUrl", "sourceSite", "listingUrl", "adviceSnippet"]
          }
        }
      }
    });

    // 60 second timeout
    const timeoutPromise = new Promise<GenerateContentResponse>((_, reject) =>
      setTimeout(() => reject(new Error("Live listings fetch timed out")), 35000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const text = response.text;
    if (!text) {
      logger.warn("Empty response from AI model");
      return [];
    }

    let rawListings;
    try {
      rawListings = JSON.parse(text);
    } catch (parseError) {
      logger.error("Failed to parse AI response as JSON", parseError, { text });
      return [];
    }

    if (!Array.isArray(rawListings)) {
      logger.warn("AI response is not an array", { rawListings });
      return [];
    }

    const deduped = new Set<string>();
    const preValidatedListings = rawListings.map(raw => {
      const url = raw.listingUrl?.toLowerCase() || '';

      if (!isValidListingUrl(url, raw.imageUrl)) {
        return null;
      }
      if (deduped.has(url)) {
        return null;
      }
      deduped.add(url);

      return {
        id: Math.random().toString(36).substring(7),
        title: raw.title,
        price: raw.price,
        mileage: raw.mileage,
        year: raw.year,
        location: raw.location || "UK",
        imageUrl: raw.imageUrl,
        sourceSite: "Auto Trader", // Force Auto Trader
        listingUrl: raw.listingUrl,
        score: 95,
        confidence: "HIGH",
        tags: [
          raw.exceedsBudget ? "Above Budget" : "Within Budget",
          raw.exceedsMileage ? "High Mileage" : "Sensible Mileage"
        ],
        passReason: raw.adviceSnippet,
        exceedsBudget: raw.exceedsBudget,
        exceedsMileage: raw.exceedsMileage,
        tradeoffAdvice: raw.tradeoffAdvice,
        timeOnMarket: raw.timeOnMarket,
        timeOnMarketConfidence: raw.timeOnMarketConfidence === 'HIGH' || raw.timeOnMarketConfidence === 'MEDIUM' || raw.timeOnMarketConfidence === 'LOW' ? raw.timeOnMarketConfidence : undefined,
        timeOnMarketContext: raw.timeOnMarketContext
      };
    }).filter(Boolean);

    // Use Zod to validate the schema
    const validListings = validateListings(preValidatedListings);
    
    // Run Pre-Output QC
    const qcPassedListings = await runPreOutputQC(validListings, budget, maxMileage);

    logger.info(`Successfully fetched and validated ${qcPassedListings.length} listings`, { 
      query, 
      budget,
      fetched: validListings.length,
      qcPassed: qcPassedListings.length
    });

    // Return up to 5 valid listings
    const finalResults = qcPassedListings.slice(0, 5);
    
    // Cache the results
    if (finalResults.length > 0) {
      listingsCache.set(cacheKey, { data: finalResults, timestamp: Date.now() });
    }

    return finalResults;

  } catch (error: unknown) {
    logger.error("Error fetching listings", error, { query, budget });
    const errorString = error instanceof Error ? error.message : String(error);
    if (errorString.includes("429") || errorString.includes("quota") || errorString.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("API_QUOTA_EXCEEDED", { cause: error });
    }
    return [];
  }
}
