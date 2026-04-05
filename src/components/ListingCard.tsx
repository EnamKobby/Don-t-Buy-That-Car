import { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { CarListing, addToBlacklist } from '../services/listingService';
import { logger } from '../utils/logger';

interface ListingCardProps {
  listing: CarListing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (imageError) {
      logger.warn('Post-Output Audit: Image failed to load in browser', { 
        listingId: listing.id, 
        imageUrl: listing.imageUrl 
      });
      addToBlacklist(listing.listingUrl);
    }
  }, [imageError, listing.id, listing.imageUrl, listing.listingUrl]);

  const handleLinkClick = () => {
    logger.info('Post-Output Audit: User clicked listing link', {
      listingId: listing.id,
      listingUrl: listing.listingUrl
    });
  };

  // If image fails to load, do not render the card at all (per PART 2 FAIL CONDITION)
  if (imageError) {
    return null;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex flex-col">
      <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-b border-gray-800">
        <img 
          src={listing.imageUrl} 
          alt={listing.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
        <div className="absolute top-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
          {listing.sourceSite}
        </div>
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          {listing.tags.map(tag => (
            <span key={tag} className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
              tag === 'Within Budget' || tag === 'Sensible Mileage' ? 'bg-green-600 text-white' :
              tag === 'Above Budget' || tag === 'High Mileage' ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'
            }`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg leading-tight mb-1">{listing.title}</h3>
        <div className="text-2xl font-black text-white mb-3">
          £{listing.price.toLocaleString()}
          {listing.exceedsBudget && <span className="text-xs text-red-500 ml-2 uppercase font-bold tracking-wider align-middle">Above Budget</span>}
        </div>
        
        <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-400 mb-4">
          <div><span className="text-gray-500">Year:</span> {listing.year}</div>
          <div>
            <span className="text-gray-500">Miles:</span> {listing.mileage.toLocaleString()}
            {listing.exceedsMileage && <span className="text-red-500 ml-1 font-bold">*High</span>}
          </div>
          <div className="col-span-2"><span className="text-gray-500">Loc:</span> {listing.location}</div>
          
          {listing.timeOnMarket && (
            <div className="col-span-2 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-gray-300 font-medium">{listing.timeOnMarket}</span>
              {listing.timeOnMarketConfidence && (
                <span className="text-[9px] uppercase tracking-widest text-gray-600 ml-1">
                  ({listing.timeOnMarketConfidence})
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-auto space-y-3">
          {listing.timeOnMarketContext && (
             <div className="bg-blue-900/20 p-3 rounded border border-blue-900/50">
               <div className="flex items-start gap-2 mb-1">
                 <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                 <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Market Insight</span>
               </div>
               <p className="text-xs text-blue-300 pl-6">{listing.timeOnMarketContext}</p>
             </div>
          )}

          {listing.tradeoffAdvice && (
             <div className="bg-red-900/20 p-3 rounded border border-red-900/50">
               <div className="flex items-start gap-2 mb-1">
                 <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                 <span className="text-xs font-bold uppercase tracking-wider text-red-400">Trade-off Required</span>
               </div>
               <p className="text-xs text-red-300 pl-6">{listing.tradeoffAdvice}</p>
             </div>
          )}

          <div className="bg-black/50 p-3 rounded border border-gray-800">
            <div className="flex items-start gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Expert Advice</span>
            </div>
            <p className="text-xs text-gray-400 pl-6">{listing.passReason}</p>
          </div>
          
          <a 
            href={listing.listingUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3 rounded hover:bg-gray-200 transition-colors"
          >
            View Listing <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
