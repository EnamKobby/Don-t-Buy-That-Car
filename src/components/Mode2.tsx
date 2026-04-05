/* eslint-disable complexity */
import React, { useState } from 'react';
import { ChevronLeft, AlertOctagon, CheckCircle, AlertTriangle, XOctagon } from 'lucide-react';
import { LiveListings } from './LiveListings';

interface Mode2Props {
  onBack: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface State {
  price: string;
  mileage: string;
  year: string;
  owners: string;
  serviceHistory: string;
  tyreBrand: string;
  sellerType: string;
  sellerQuality: string;
  fuelType: string;
  carPlay: string;
  carBrand: string;
}

const INITIAL_STATE: State = {
  price: '',
  mileage: '',
  year: '',
  owners: '',
  serviceHistory: '',
  tyreBrand: '',
  sellerType: '',
  sellerQuality: '',
  fuelType: '',
  carPlay: '',
  carBrand: '',
};

type CarCategory = "premium_german" | "premium_non_german" | "mid_premium" | "reliability_focused" | "budget";

interface BrandInfo {
  brand: string;
  category: CarCategory;
  maintenance_cost: "high" | "medium" | "low";
  risk_profile: "higher" | "balanced" | "lower" | "mixed";
}

const CAR_BRANDS: Record<string, BrandInfo> = {
  'BMW': { brand: 'BMW', category: 'premium_german', maintenance_cost: 'high', risk_profile: 'higher' },
  'Audi': { brand: 'Audi', category: 'premium_german', maintenance_cost: 'high', risk_profile: 'higher' },
  'Mercedes-Benz': { brand: 'Mercedes-Benz', category: 'premium_german', maintenance_cost: 'high', risk_profile: 'higher' },
  'Lexus': { brand: 'Lexus', category: 'premium_non_german', maintenance_cost: 'high', risk_profile: 'higher' },
  'Volvo': { brand: 'Volvo', category: 'premium_non_german', maintenance_cost: 'high', risk_profile: 'higher' },
  'Jaguar': { brand: 'Jaguar', category: 'premium_non_german', maintenance_cost: 'high', risk_profile: 'higher' },
  'Land Rover': { brand: 'Land Rover', category: 'premium_non_german', maintenance_cost: 'high', risk_profile: 'higher' },
  'Volkswagen': { brand: 'Volkswagen', category: 'mid_premium', maintenance_cost: 'medium', risk_profile: 'balanced' },
  'Skoda': { brand: 'Skoda', category: 'mid_premium', maintenance_cost: 'medium', risk_profile: 'balanced' },
  'SEAT': { brand: 'SEAT', category: 'mid_premium', maintenance_cost: 'medium', risk_profile: 'balanced' },
  'Ford': { brand: 'Ford', category: 'mid_premium', maintenance_cost: 'medium', risk_profile: 'balanced' },
  'Peugeot': { brand: 'Peugeot', category: 'mid_premium', maintenance_cost: 'medium', risk_profile: 'balanced' },
  'Renault': { brand: 'Renault', category: 'mid_premium', maintenance_cost: 'medium', risk_profile: 'balanced' },
  'Vauxhall': { brand: 'Vauxhall', category: 'mid_premium', maintenance_cost: 'medium', risk_profile: 'balanced' },
  'Mini': { brand: 'Mini', category: 'mid_premium', maintenance_cost: 'medium', risk_profile: 'balanced' },
  'Toyota': { brand: 'Toyota', category: 'reliability_focused', maintenance_cost: 'low', risk_profile: 'lower' },
  'Honda': { brand: 'Honda', category: 'reliability_focused', maintenance_cost: 'low', risk_profile: 'lower' },
  'Mazda': { brand: 'Mazda', category: 'reliability_focused', maintenance_cost: 'low', risk_profile: 'lower' },
  'Hyundai': { brand: 'Hyundai', category: 'reliability_focused', maintenance_cost: 'low', risk_profile: 'lower' },
  'Kia': { brand: 'Kia', category: 'reliability_focused', maintenance_cost: 'low', risk_profile: 'lower' },
  'Suzuki': { brand: 'Suzuki', category: 'reliability_focused', maintenance_cost: 'low', risk_profile: 'lower' },
  'Dacia': { brand: 'Dacia', category: 'budget', maintenance_cost: 'low', risk_profile: 'mixed' },
  'Fiat': { brand: 'Fiat', category: 'budget', maintenance_cost: 'low', risk_profile: 'mixed' },
  'Citroen': { brand: 'Citroen', category: 'budget', maintenance_cost: 'low', risk_profile: 'mixed' },
  'MG': { brand: 'MG', category: 'budget', maintenance_cost: 'low', risk_profile: 'mixed' },
};

function getBrandInfo(brand: string): BrandInfo {
  return CAR_BRANDS[brand] || { brand, category: 'mid_premium', maintenance_cost: 'medium', risk_profile: 'balanced' };
}

type TyreTier = "premium" | "mid" | "budget" | "unknown";

interface TyreInfo {
  brand: string;
  tier: TyreTier;
  signal: "positive" | "neutral" | "negative" | "slightly negative";
}

const TYRE_BRANDS: Record<string, TyreInfo> = {
  'Michelin': { brand: 'Michelin', tier: 'premium', signal: 'positive' },
  'Continental': { brand: 'Continental', tier: 'premium', signal: 'positive' },
  'Goodyear': { brand: 'Goodyear', tier: 'premium', signal: 'positive' },
  'Bridgestone': { brand: 'Bridgestone', tier: 'premium', signal: 'positive' },
  'Pirelli': { brand: 'Pirelli', tier: 'premium', signal: 'positive' },
  'Dunlop': { brand: 'Dunlop', tier: 'premium', signal: 'positive' },
  'Hankook': { brand: 'Hankook', tier: 'mid', signal: 'neutral' },
  'Falken': { brand: 'Falken', tier: 'mid', signal: 'neutral' },
  'Yokohama': { brand: 'Yokohama', tier: 'mid', signal: 'neutral' },
  'Toyo': { brand: 'Toyo', tier: 'mid', signal: 'neutral' },
  'Kumho': { brand: 'Kumho', tier: 'mid', signal: 'neutral' },
  'Avon': { brand: 'Avon', tier: 'mid', signal: 'neutral' },
  'Uniroyal': { brand: 'Uniroyal', tier: 'mid', signal: 'neutral' },
  'Landsail': { brand: 'Landsail', tier: 'budget', signal: 'negative' },
  'Linglong': { brand: 'Linglong', tier: 'budget', signal: 'negative' },
  'Triangle': { brand: 'Triangle', tier: 'budget', signal: 'negative' },
  'Sunny': { brand: 'Sunny', tier: 'budget', signal: 'negative' },
  'Autogreen': { brand: 'Autogreen', tier: 'budget', signal: 'negative' },
  'Accelera': { brand: 'Accelera', tier: 'budget', signal: 'negative' },
  'RoadX': { brand: 'RoadX', tier: 'budget', signal: 'negative' },
  'Event': { brand: 'Event', tier: 'budget', signal: 'negative' },
  'Mixed': { brand: 'Mixed', tier: 'mid', signal: 'slightly negative' },
};

function getTyreInfo(brand: string): TyreInfo {
  return TYRE_BRANDS[brand] || { brand, tier: 'unknown', signal: 'negative' };
}

export function Mode2({ onBack }: Mode2Props) {
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<State>(INITIAL_STATE);

  const handleNext = () => {
    setStep((prev) => (prev + 1) as Step);
  };

  const updateState = (key: keyof State, value: string) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  if (step === 8) {
    return <Mode2Output state={state} onBack={onBack} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="p-4 flex items-center border-b border-gray-800">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center font-mono text-xs text-gray-500 uppercase tracking-widest">
          Check This Car - Step {step} of 7
        </div>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-6 flex flex-col max-w-md mx-auto w-full">
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <h2 className="text-4xl font-black uppercase leading-none">The Basics</h2>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-500">£</span>
                <input
                  type="number"
                  value={state.price}
                  onChange={(e) => updateState('price', e.target.value)}
                  className="w-full bg-gray-900 border-2 border-gray-800 p-4 pl-10 text-xl focus:border-white focus:outline-none transition-colors"
                  placeholder="e.g. 12000"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Mileage</label>
              <input
                type="number"
                value={state.mileage}
                onChange={(e) => updateState('mileage', e.target.value)}
                className="w-full bg-gray-900 border-2 border-gray-800 p-4 text-xl focus:border-white focus:outline-none transition-colors"
                placeholder="e.g. 65000"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Year</label>
              <input
                type="number"
                value={state.year}
                onChange={(e) => updateState('year', e.target.value)}
                className="w-full bg-gray-900 border-2 border-gray-800 p-4 text-xl focus:border-white focus:outline-none transition-colors"
                placeholder="e.g. 2018"
              />
            </div>
            <button
              onClick={handleNext}
              disabled={!state.price || !state.mileage || !state.year}
              className="w-full bg-white text-black p-4 font-bold text-lg uppercase tracking-wider disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <h2 className="text-4xl font-black uppercase leading-none">The Brand</h2>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">What brand is it?</label>
              <select
                value={state.carBrand}
                onChange={(e) => updateState('carBrand', e.target.value)}
                className="w-full bg-gray-900 border-2 border-gray-800 p-4 text-xl focus:border-white focus:outline-none transition-colors appearance-none"
              >
                <option value="">Select a brand...</option>
                {Object.keys(CAR_BRANDS).sort().map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
                <option value="Other">Other / Unknown</option>
              </select>
              {state.carBrand && state.carBrand !== 'Other' && (
                <div className="p-4 bg-gray-900 border-l-2 border-white mt-4">
                  <p className="text-sm">
                    You selected <span className="font-bold text-white">{state.carBrand}</span>.
                    <br />
                    This brand is known for <span className="font-bold text-white">{getBrandInfo(state.carBrand).maintenance_cost}</span> maintenance costs and a <span className="font-bold text-white">{getBrandInfo(state.carBrand).risk_profile}</span> risk profile.
                  </p>
                </div>
              )}
              {state.carBrand === 'Other' && (
                <div className="p-4 bg-gray-900 border-l-2 border-yellow-500 mt-4">
                  <p className="text-sm text-yellow-500">
                    Unknown brand selected. We will assume average costs but reduce confidence.
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleNext}
              disabled={!state.carBrand}
              className="w-full bg-white text-black p-4 font-bold text-lg uppercase tracking-wider disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <h2 className="text-4xl font-black uppercase leading-none">History</h2>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Number of Owners</label>
              <input
                type="number"
                value={state.owners}
                onChange={(e) => updateState('owners', e.target.value)}
                className="w-full bg-gray-900 border-2 border-gray-800 p-4 text-xl focus:border-white focus:outline-none transition-colors"
                placeholder="e.g. 3"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Service History</label>
              <div className="grid grid-cols-2 gap-2">
                {['Full', 'Partial', 'None', 'Unknown'].map(type => (
                  <button
                    key={type}
                    onClick={() => updateState('serviceHistory', type)}
                    className={`p-4 border-2 font-bold uppercase text-sm ${state.serviceHistory === type ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-400'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleNext}
              disabled={!state.owners || !state.serviceHistory}
              className="w-full bg-white text-black p-4 font-bold text-lg uppercase tracking-wider disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <h2 className="text-4xl font-black uppercase leading-none">Condition</h2>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Tyre Brand</label>
              <select
                value={state.tyreBrand}
                onChange={(e) => updateState('tyreBrand', e.target.value)}
                className="w-full bg-gray-900 border-2 border-gray-800 p-4 text-xl focus:border-white focus:outline-none transition-colors appearance-none"
              >
                <option value="">Select tyre brand...</option>
                {Object.keys(TYRE_BRANDS).sort().map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
                <option value="Other">Other / Unknown</option>
              </select>
              {state.tyreBrand && state.tyreBrand !== 'Other' && state.tyreBrand !== 'Mixed' && (
                <div className="p-4 bg-gray-900 border-l-2 border-white mt-4">
                  <p className="text-sm">
                    <span className="font-bold text-white">{state.tyreBrand}</span> tyres detected.
                    <br />
                    These are <span className="font-bold text-white">{getTyreInfo(state.tyreBrand).tier}</span> tyres and usually indicate {getTyreInfo(state.tyreBrand).signal === 'positive' ? 'good maintenance' : getTyreInfo(state.tyreBrand).signal === 'neutral' ? 'acceptable maintenance' : 'cost-cutting on maintenance'}.
                  </p>
                </div>
              )}
              {state.tyreBrand === 'Mixed' && (
                <div className="p-4 bg-gray-900 border-l-2 border-yellow-500 mt-4">
                  <p className="text-sm text-yellow-500">
                    Mixed tyres detected. This can indicate inconsistent maintenance.
                  </p>
                </div>
              )}
              {state.tyreBrand === 'Other' && (
                <div className="p-4 bg-gray-900 border-l-2 border-red-500 mt-4">
                  <p className="text-sm text-red-500">
                    Unknown tyres detected. This reduces our confidence in the car's maintenance history.
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleNext}
              disabled={!state.tyreBrand}
              className="w-full bg-white text-black p-4 font-bold text-lg uppercase tracking-wider disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <h2 className="text-4xl font-black uppercase leading-none">The Seller</h2>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Seller Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['Private', 'Dealer'].map(type => (
                  <button
                    key={type}
                    onClick={() => updateState('sellerType', type)}
                    className={`p-4 border-2 font-bold uppercase text-sm ${state.sellerType === type ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-400'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Seller Quality</label>
              <div className="grid grid-cols-1 gap-2">
                {['Clear & Transparent', 'Vague / Missing Info', 'Avoidant / Pushy'].map(type => (
                  <button
                    key={type}
                    onClick={() => updateState('sellerQuality', type)}
                    className={`p-4 border-2 font-bold uppercase text-sm text-left ${state.sellerQuality === type ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-400'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleNext}
              disabled={!state.sellerType || !state.sellerQuality}
              className="w-full bg-white text-black p-4 font-bold text-lg uppercase tracking-wider disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 6 && (
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <h2 className="text-4xl font-black uppercase leading-none">Fuel & Tech</h2>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Fuel Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['Petrol', 'Diesel', 'Hybrid', 'EV'].map(type => (
                  <button
                    key={type}
                    onClick={() => updateState('fuelType', type)}
                    className={`p-4 border-2 font-bold uppercase text-sm ${state.fuelType === type ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-400'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Has Apple CarPlay / Android Auto?</label>
              <div className="grid grid-cols-3 gap-2">
                {['Yes', 'No', 'Unknown'].map(type => (
                  <button
                    key={type}
                    onClick={() => updateState('carPlay', type)}
                    className={`p-4 border-2 font-bold uppercase text-sm ${state.carPlay === type ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-400'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleNext}
              disabled={!state.fuelType || !state.carPlay}
              className="w-full bg-white text-black p-4 font-bold text-lg uppercase tracking-wider disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 7 && (
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <h2 className="text-4xl font-black uppercase leading-none text-red-600">Warning</h2>
            <p className="text-xl font-medium">
              We are going to evaluate this car brutally.
            </p>
            <p className="text-gray-400">
              If you are emotionally attached to this car, prepare to be disappointed. We do not care about your feelings, we care about your wallet.
            </p>
            <button
              onClick={handleNext}
              className="w-full bg-red-600 text-white p-4 font-bold text-lg uppercase tracking-wider"
            >
              I Understand. Evaluate It.
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function Mode2Output({ state, onBack }: { state: State, onBack: () => void }) {
  // Scoring Engine
  let score = 100;
  const redFlags: string[] = [];
  const consequences: string[] = [];
  let isHardStop = false;

  const price = parseInt(state.price, 10);
  const mileage = parseInt(state.mileage, 10);
  const year = parseInt(state.year, 10);
  const owners = parseInt(state.owners, 10);
  const age = new Date().getFullYear() - year;

  const brandInfo = getBrandInfo(state.carBrand);
  const tyreInfo = getTyreInfo(state.tyreBrand);

  // Baselines (simplified)
  let baselineMin: number;
  let baselineMax: number;

  if (brandInfo.category === 'premium_german' || brandInfo.category === 'premium_non_german') {
    if (year >= 2018) { baselineMin = 11000; baselineMax = 15000; }
    else { baselineMin = 7500; baselineMax = 11000; }
  } else if (brandInfo.category === 'mid_premium') {
    if (year >= 2018) { baselineMin = 9000; baselineMax = 13000; }
    else { baselineMin = 6500; baselineMax = 10000; }
  } else {
    if (year >= 2018) { baselineMin = 10000; baselineMax = 14000; }
    else { baselineMin = 7000; baselineMax = 11000; }
  }

  // Rules
  if (price < baselineMin * 0.8) {
    score -= 20;
    redFlags.push("Suspiciously Underpriced");
    consequences.push("High chance of hidden damage or impending catastrophic failure.");
  } else if (price > baselineMax * 1.1) {
    score -= 5;
    redFlags.push("Overpriced");
  }

  if (mileage > 100000) {
    score -= 10;
    redFlags.push("High Mileage");
  }

  if (age > 8 && mileage < 20000) {
    score -= 5;
    redFlags.push("Suspiciously Low Mileage");
    consequences.push("Cars sitting unused rot from the inside. Seals dry out, batteries die.");
  }

  if (state.serviceHistory === 'None' || state.serviceHistory === 'Unknown') {
    score -= 30;
    redFlags.push("No Service History");
    consequences.push("You are buying a mystery box. Expect to replace major components soon.");
  } else if (state.serviceHistory === 'Partial') {
    score -= 10;
    redFlags.push("Service Gaps");
  }

  if (owners > 4) {
    score -= 15;
    redFlags.push("Too Many Owners");
    consequences.push("A car passed around this much usually has an expensive, unfixable problem.");
  }

  if (tyreInfo.tier === 'budget') {
    score -= 10;
    redFlags.push("Budget Tyres");
    consequences.push("If they cheaped out on the only thing touching the road, they cheaped out on maintenance.");
  } else if (state.tyreBrand === 'Mixed') {
    score -= 5;
    redFlags.push("Mixed Tyres");
    consequences.push("Inconsistent maintenance. Check tread depths carefully.");
  }

  if (state.sellerQuality.includes('Vague')) {
    score -= 15;
    redFlags.push("Vague Seller");
  } else if (state.sellerQuality.includes('Avoidant')) {
    score -= 25;
    redFlags.push("Avoidant Seller");
    consequences.push("They are hiding something. Period.");
  }

  if (state.fuelType === 'Diesel' && mileage / age < 8000) {
    score -= 15;
    redFlags.push("Diesel Misuse");
    consequences.push("Low mileage diesels suffer from clogged DPFs and EGR valves. Very expensive.");
  }

  // Hard Stops
  if ((state.serviceHistory === 'None' || state.serviceHistory === 'Unknown') && state.sellerQuality.includes('Vague')) {
    isHardStop = true;
    redFlags.push("HARD STOP: No History + Vague Seller");
  }
  if (price < baselineMin * 0.8 && owners > 3) {
    isHardStop = true;
    redFlags.push("HARD STOP: Cheap + Passed Around");
  }
  if (state.sellerQuality.includes('Avoidant')) {
    isHardStop = true;
    redFlags.push("HARD STOP: Avoidant Seller");
  }

  // Verdict
  let verdict: string;
  let verdictColor: string;
  let verdictIcon: React.ReactNode;

  if (isHardStop || score < 60) {
    verdict = "WALK AWAY";
    verdictColor = "bg-red-600";
    verdictIcon = <XOctagon className="w-16 h-16 text-white mb-4" />;
  } else if (score < 80) {
    verdict = "CAUTION";
    verdictColor = "bg-yellow-500 text-black";
    verdictIcon = <AlertTriangle className="w-16 h-16 text-black mb-4" />;
  } else {
    verdict = "STRONG BUY";
    verdictColor = "bg-green-500 text-black";
    verdictIcon = <CheckCircle className="w-16 h-16 text-black mb-4" />;
  }

  // Confidence
  let confidence = "HIGH";
  if (state.serviceHistory === 'Unknown' || state.tyreBrand === 'Other' || state.carPlay === 'Unknown') {
    confidence = "LOW";
  } else if (state.sellerQuality.includes('Vague')) {
    confidence = "MEDIUM";
  }

  // Cost of Ownership
  let costOfOwnership = "£300–£700/year";
  if (brandInfo.category === 'premium_german' || brandInfo.category === 'premium_non_german') costOfOwnership = "£800–£1500/year";
  else if (brandInfo.category === 'mid_premium') costOfOwnership = "£500–£900/year";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="p-4 flex items-center border-b border-gray-800 sticky top-0 bg-black z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center font-black uppercase tracking-widest">
          The Verdict
        </div>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-6 max-w-md mx-auto w-full space-y-8 pb-24">
        
        <div className={`${verdictColor} p-8 flex flex-col items-center justify-center text-center`}>
          {verdictIcon}
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">{verdict}</h1>
          <div className="mt-4 font-bold uppercase tracking-widest text-sm opacity-80">
            Score: {score}/100
          </div>
        </div>

        <div className="flex justify-between items-center border-y border-gray-800 py-4">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Confidence</div>
            <div className={`font-black ${confidence === 'LOW' ? 'text-red-500' : confidence === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'}`}>{confidence}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Est. Yearly Cost</div>
            <div className="font-black text-white">{costOfOwnership}</div>
          </div>
        </div>

        {redFlags.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black uppercase text-red-500">Red Flags</h2>
            <ul className="space-y-2">
              {redFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 bg-gray-900 p-3 border-l-2 border-red-600">
                  <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-bold">{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {consequences.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black uppercase text-yellow-500">Consequences</h2>
            <ul className="space-y-2">
              {consequences.map((cons, i) => (
                <li key={i} className="flex items-start gap-2 bg-gray-900 p-3 border-l-2 border-yellow-500">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <span className="text-gray-300">{cons}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(isHardStop || score < 60) && (
          <div className="bg-gray-900 p-6 border-2 border-red-600 space-y-4">
            <h3 className="font-black uppercase text-red-500 tracking-widest text-sm">Regret Simulation</h3>
            <p className="text-lg font-medium italic">
              "Imagine 3 months after buying: Repair cost: £1,200. Would this be acceptable?"
            </p>
            <p className="text-sm text-gray-400">
              You are ignoring multiple warning signs.
            </p>
          </div>
        )}

        <div className="bg-gray-900 p-6 border-2 border-gray-800 space-y-4">
          <h3 className="font-black uppercase text-gray-400 tracking-widest text-sm">Comparison Panel</h3>
          <p className="text-lg font-medium">
            For the same budget (£{price}), you could get:
          </p>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> A lower risk option</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /> A better value option</li>
          </ul>
        </div>

        {(isHardStop || score < 80) && (
          <LiveListings 
            query={`reliable alternatives to ${state.carBrand}`}
            budget={price}
            originalChoice={`${state.carBrand}`}
            title="Better Options Right Now"
            subtitle="This car is risky. Consider these sensible alternatives instead:"
            maxMileage={mileage}
          />
        )}

        <div className="space-y-4 pt-8">
          <button
            onClick={onBack}
            className="w-full bg-white text-black p-4 font-bold text-lg uppercase tracking-wider"
          >
            Walk Away
          </button>
          
          <button
            onClick={() => {
              alert("Behaviour logged. You have been warned.");
              onBack();
            }}
            className="w-full border-2 border-red-600 text-red-600 p-4 font-bold text-lg uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors"
          >
            Proceed Anyway
          </button>
        </div>

      </main>
    </div>
  );
}
