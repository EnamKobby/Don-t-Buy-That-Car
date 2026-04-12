import { useEffect, useState } from 'react';
import { CarListing, fetchLiveListings } from '../services/listingService';
import { ListingCard } from './ListingCard';
import { Loader2, AlertTriangle } from 'lucide-react';

interface LiveListingsProps {
  query: string;
  budget: number;
  title?: string;
  subtitle?: string;
  originalChoice?: string;
  maxMileage?: number;
}

export function LiveListings({ 
  query, 
  budget, 
  title = "Available Right Now", 
  subtitle = "These listings match your criteria and passed our checks.", 
  originalChoice,
  maxMileage
}: LiveListingsProps) {
  const [hasTriggered, setHasTriggered] = useState(false);
  const [showPreSearch, setShowPreSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<CarListing[]>([]);
  const [stretchListings, setStretchListings] = useState<CarListing[]>([]);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);

  const loadingMessages = [
    "Searching across UK car listings...",
    "Filtering out risky or poor-quality cars...",
    "Running Quality Control checks...",
    "Finding options that are actually worth your time..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessageIdx(prev => (prev + 1) % 4); // Hardcoded 4 to avoid dependency warning
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleInitialClick = () => {
    // Heuristic: if budget is under 15000, there are usually meaningful upgrades
    if (budget < 15000) {
      setShowPreSearch(true);
    } else {
      executeSearch(false);
    }
  };

  const executeSearch = async (includeStretch: boolean) => {
    setShowPreSearch(false);
    setHasTriggered(true);
    setLoading(true);
    setError(null);
    
    try {
      let stretchResults: CarListing[] = [];

      if (includeStretch) {
        const stretchBudget = budget + 1500;
        const [results, expandedResults] = await Promise.all([
          fetchLiveListings(query, budget, originalChoice, maxMileage),
          fetchLiveListings(query, stretchBudget, originalChoice, maxMileage)
        ]);
        stretchResults = expandedResults.filter(r => r.price > budget * 1.1);
        setListings(results);
        setStretchListings(stretchResults);
      } else {
        const results = await fetchLiveListings(query, budget, originalChoice, maxMileage);
        if (results.length === 0) {
          const stretchBudget = budget + 1500;
          stretchResults = await fetchLiveListings(query, stretchBudget, originalChoice, maxMileage);
          stretchResults = stretchResults.filter(r => r.price > budget * 1.1);
        }

        setListings(results);
        setStretchListings(stretchResults);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "API_QUOTA_EXCEEDED") {
        setError("We are experiencing high demand and have temporarily hit our search limits. Please try again in a few minutes.");
      } else {
        setError("We’re having trouble retrieving reliable listings right now.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hasTriggered && !showPreSearch) {
    return (
      <div className="py-8 border-t border-gray-800 mt-8">
        <h2 className="text-2xl font-black uppercase mb-4">Want to see what's actually available right now?</h2>
        <p className="text-gray-400 mb-6 max-w-2xl">
          We can search the UK used car market and find real listings that match these recommendations.
          <br /><br />
          We'll filter out risky or poor-quality cars.
        </p>
        <button 
          onClick={handleInitialClick}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-lg w-full sm:w-auto transition-colors text-lg"
        >
          Search Live Listings
        </button>
      </div>
    );
  }

  if (showPreSearch) {
    return (
      <div className="py-8 border-t border-gray-800 mt-8">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-2">You're very close to better options.</h3>
          <p className="text-gray-400 mb-6">
            If you increase your budget slightly, you may unlock significantly better cars.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => executeSearch(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Include better options (+£500–£2,000)
            </button>
            <button 
              onClick={() => executeSearch(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Stay within my budget
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-6 border-t border-gray-800 mt-8 bg-gray-900/50 rounded-xl">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-lg font-bold text-gray-300 animate-pulse text-center px-4">
          {loadingMessages[loadingMessageIdx]}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 border-t border-gray-800 mt-8">
        <div className="bg-red-900/20 p-6 border border-red-900/50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-red-400 mb-2">Search Temporarily Unavailable</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <button 
                onClick={() => executeSearch(false)}
                className="bg-red-900/50 hover:bg-red-800/50 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (listings.length === 0 && stretchListings.length === 0) {
    return (
      <div className="py-8 border-t border-gray-800 mt-8">
        <div className="bg-gray-900 p-6 border-l-4 border-yellow-500 rounded-r-lg">
          <p className="text-gray-300 font-medium">
            We couldn’t find real listings that meet our standards right now.
          </p>
        </div>
      </div>
    );
  }

  const totalResults = listings.length + stretchListings.length;

  return (
    <div className="py-8 border-t border-gray-800 mt-8 space-y-8">
      {totalResults > 0 && totalResults <= 2 && (
        <div className="bg-gray-900 p-6 border-l-4 border-blue-500 mb-6">
          <p className="text-gray-300">
            Only a few listings met our standards.<br/>
            We prioritised quality over quantity.
          </p>
        </div>
      )}

      {listings.length > 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black uppercase">{title}</h2>
            <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
          </div>
          
          <div className="space-y-4">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {stretchListings.length > 0 && (
        <div className="space-y-6 bg-blue-900/20 p-6 rounded-lg border border-blue-900/50">
          <div>
            <h2 className="text-2xl font-black uppercase text-blue-400">Price Stretch Options</h2>
            <p className="text-blue-200/70 text-sm mt-1">
              You are very close to significantly better options. Here’s what a slightly higher budget gets you:
            </p>
          </div>
          
          <div className="space-y-4">
            {stretchListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
