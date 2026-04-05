import { useEffect, useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Loader2, AlertTriangle } from 'lucide-react';
import { logger } from '../utils/logger';

interface MarketRealityCheckProps {
  state: Record<string, string>;
  onComplete: (isValid: boolean) => void;
}

interface RealityCheckResult {
  isRealistic?: boolean;
  unlikelyReasoning?: string;
  budgetAdjustment?: string;
  mileageAdjustment?: string;
  modelAdjustment?: string;
}

export function MarketRealityCheck({ state, onComplete }: MarketRealityCheckProps) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<RealityCheckResult | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkReality(): Promise<void> {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are an expert UK car market analyst.
Evaluate if the following user criteria are realistic in the current UK used car market.
Budget: £${state.budget}
Model/Brand: ${state.brand} ${state.carType}
Minimum Year: ${state.minYear}
Maximum Mileage: ${state.maxMileage}
Must-have Features: ${state.features}

If this combination is highly unlikely or impossible (e.g., £10k for a 2018 BMW with under 50k miles and Apple CarPlay), set isRealistic to false.
If it is realistic, set isRealistic to true.

If false, you MUST provide:
1. unlikelyReasoning: Explain exactly why. Format: "At £[Budget], a [Model] with:\n- Under [Mileage] mileage\n- [Features]\n\nis rare or unavailable."
2. budgetAdjustment: e.g., "+£3,000"
3. mileageAdjustment: e.g., "+40,000 miles"
4. modelAdjustment: e.g., "Consider a Skoda Octavia instead"`;

        const generatePromise = ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isRealistic: { type: Type.BOOLEAN },
                unlikelyReasoning: { type: Type.STRING },
                budgetAdjustment: { type: Type.STRING },
                mileageAdjustment: { type: Type.STRING },
                modelAdjustment: { type: Type.STRING }
              },
              required: ["isRealistic"]
            }
          }
        });

        // 30 second timeout to prevent hanging
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Market reality check timed out")), 30000)
        );

        const response = await Promise.race([generatePromise, timeoutPromise]);

        if (!isMounted) return;

        const data = JSON.parse(response.text || "{}");
        setResult(data);
        onComplete(data.isRealistic ?? true); // Default to true if missing
      } catch (e) {
        logger.error("MarketRealityCheck error", e, { state });
        if (isMounted) {
          onComplete(true); // Fallback to true if error
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkReality();

    return () => {
      isMounted = false;
    };
  }, [state, onComplete]);

  if (loading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Running Market Reality Check...</p>
      </div>
    );
  }

  if (!result || result.isRealistic) {
    return null; // Don't show anything if it's realistic, let the rest of the UI flow
  }

  return (
    <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-6 mb-8">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
        <div>
          <h3 className="text-xl font-black text-red-400 uppercase">This combination is unlikely in the current market.</h3>
        </div>
      </div>
      
      <div className="text-gray-300 whitespace-pre-line mb-6 pl-9">
        {result.unlikelyReasoning as string}
      </div>
      
      <div className="pl-9">
        <p className="font-bold text-white mb-2">You will likely need to adjust at least one of:</p>
        <ul className="space-y-2 text-gray-300">
          {result.budgetAdjustment && (
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="font-bold text-white">Budget:</span> {result.budgetAdjustment as string}
            </li>
          )}
          {result.mileageAdjustment && (
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="font-bold text-white">Mileage:</span> {result.mileageAdjustment as string}
            </li>
          )}
          {result.modelAdjustment && (
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="font-bold text-white">Model:</span> {result.modelAdjustment as string}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
