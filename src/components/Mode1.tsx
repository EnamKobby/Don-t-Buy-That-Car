/* eslint-disable complexity */
import { useState } from 'react';
import { AlertOctagon, ArrowRight, ChevronLeft, AlertTriangle } from 'lucide-react';
import { LiveListings } from './LiveListings';
import { MarketRealityCheck } from './MarketRealityCheck';

interface Mode1Props {
  onBack: () => void;
}

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface State {
  [key: string]: string;
  budget: string;
  financeType: string;
  brand: string;
  carType: string;
  minYear: string;
  maxMileage: string;
  features: string;
  usage: string;
  annualMileage: string;
  brandBias: string;
  mileageBelief: string;
  riskTolerance: string;
}

const INITIAL_STATE: State = {
  budget: '',
  financeType: '',
  brand: '',
  carType: '',
  minYear: '',
  maxMileage: '',
  features: '',
  usage: '',
  annualMileage: '',
  brandBias: '',
  mileageBelief: '',
  riskTolerance: '',
};

export function Mode1({ onBack }: Mode1Props) {
  const [step, setStep] = useState<Step>(0);
  const [state, setState] = useState<State>(INITIAL_STATE);
  const [interruption, setInterruption] = useState<{ message: string; title: string } | null>(null);
  const [warningsIgnored, setWarningsIgnored] = useState(0);

  const handleNext = () => {
    // Interruption Engine Evaluation
    const currentStep = step;
    
    if (currentStep === 1) {
      if (!state.budget || !state.financeType) return;
    }

    if (currentStep === 3) {
      if (!state.minYear || !state.maxMileage) return;
      
      const budgetNum = parseInt(state.budget.replace(/[^0-9]/g, ''), 10);
      const yearNum = parseInt(state.minYear, 10);
      
      // Rule 1: Budget vs Expectation
      if (budgetNum < 10000 && yearNum >= 2018 && (state.brand.toLowerCase().includes('bmw') || state.brand.toLowerCase().includes('audi') || state.brand.toLowerCase().includes('mercedes'))) {
        showInterruption(
          "Unrealistic Expectation",
          `This combination does not exist reliably in the real market.\n\nAt £${budgetNum}, cars like this are often:\n- Poorly maintained\n- Previously damaged\n- Or due expensive repairs`
        );
        return;
      }
    }

    if (currentStep === 4) {
      if (!state.usage || !state.annualMileage) return;
      
      // Rule 2: Fuel Mismatch (assuming diesel if they want a big SUV for short trips, but let's just warn if short trips + high expectation)
      if (state.usage === 'Short city trips' && parseInt(state.annualMileage, 10) < 8000 && state.carType === 'SUV') {
        showInterruption(
          "Fuel & Usage Mismatch",
          "If you buy a diesel SUV for short city trips, this increases the risk of DPF failure and costly repairs."
        );
        return;
      }
    }

    if (currentStep === 5) {
      const budgetNum = parseInt(state.budget.replace(/[^0-9]/g, ''), 10);
      // Rule 3: Brand Bias
      if (budgetNum < 8000 && (state.brandBias.toLowerCase().includes('bmw') || state.brandBias.toLowerCase().includes('audi') || state.brandBias.toLowerCase().includes('mercedes'))) {
        showInterruption(
          "Dangerous Brand Bias",
          "You are prioritising brand over condition. A cheap premium car is the most expensive car you can buy."
        );
        return;
      }
    }

    if (currentStep === 6) {
      const mileageBeliefNum = parseInt(state.mileageBelief.replace(/[^0-9]/g, ''), 10);
      const budgetNum = parseInt(state.budget.replace(/[^0-9]/g, ''), 10);
      // Rule 4: Mileage Illusion
      if (mileageBeliefNum < 50000 && budgetNum < 10000) {
        showInterruption(
          "Mileage Illusion",
          "You are overvaluing mileage. A well-maintained 80k mile car is better than a neglected 40k mile car."
        );
        return;
      }
    }

    if (currentStep === 7) {
      if (!state.riskTolerance) return;
      // Rule 5: Reliability Conflict
      if ((state.brand.toLowerCase().includes('bmw') || state.brand.toLowerCase().includes('audi') || state.brand.toLowerCase().includes('land rover')) && state.riskTolerance === 'low_risk_tolerance') {
        showInterruption(
          "Reliability Conflict",
          "These goals conflict. You want a premium/luxury brand but cannot tolerate unexpected repair costs. This is a recipe for disaster."
        );
        return;
      }
    }

    proceedToNext();
  };

  const showInterruption = (title: string, message: string) => {
    setInterruption({ title, message });
  };

  const proceedToNext = () => {
    setInterruption(null);
    setStep((prev) => (prev + 1) as Step);
  };

  const ignoreWarning = () => {
    setWarningsIgnored(prev => prev + 1);
    proceedToNext();
  };

  const updateState = (key: keyof State, value: string) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  if (interruption) {
    return (
      <div className="min-h-screen bg-red-600 text-white p-6 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full space-y-8">
          <AlertOctagon className="w-16 h-16" />
          <h2 className="text-4xl font-black uppercase leading-none">{interruption.title}</h2>
          <p className="text-xl font-medium whitespace-pre-line">{interruption.message}</p>
          
          <div className="pt-8 space-y-4">
            <button
              onClick={() => setInterruption(null)}
              className="w-full bg-white text-red-600 p-4 font-bold text-lg uppercase tracking-wider"
            >
              Adjust Expectations
            </button>
            <button
              onClick={ignoreWarning}
              className="w-full border-2 border-white text-white p-4 font-bold text-lg uppercase tracking-wider opacity-70 hover:opacity-100"
            >
              Continue Anyway (High Risk)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 8) {
    return <Mode1Output state={state} warningsIgnored={warningsIgnored} onBack={onBack} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="p-4 flex items-center border-b border-gray-800">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center font-mono text-xs text-gray-500 uppercase tracking-widest">
          Step {step} of 7
        </div>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-6 flex flex-col max-w-md mx-auto w-full">
        {step === 0 && (
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <h2 className="text-4xl font-black uppercase leading-none">
              Find the Right Car
            </h2>
            <p className="text-xl text-gray-400">
              We will ask you a series of questions. Answer honestly.
            </p>
            <button
              onClick={proceedToNext}
              className="w-full bg-white text-black p-4 font-bold text-lg uppercase tracking-wider flex items-center justify-center gap-2"
            >
              Start <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <label className="block text-2xl font-bold">What is your absolute maximum budget?</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-500">£</span>
                <input
                  type="number"
                  value={state.budget}
                  onChange={(e) => updateState('budget', e.target.value)}
                  className="w-full bg-gray-900 border-2 border-gray-800 p-4 pl-10 text-xl focus:border-white focus:outline-none transition-colors"
                  placeholder="e.g. 15000"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-xl font-bold text-gray-400">Is this cash, finance, or both?</label>
              <div className="grid grid-cols-3 gap-2">
                {['Cash', 'Finance', 'Both'].map(type => (
                  <button
                    key={type}
                    onClick={() => updateState('financeType', type)}
                    className={`p-4 border-2 font-bold uppercase text-sm ${state.financeType === type ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-400'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleNext}
              disabled={!state.budget || !state.financeType}
              className="w-full bg-white text-black p-4 font-bold text-lg uppercase tracking-wider disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <label className="block text-2xl font-bold">What car do you want, not what you think is sensible?</label>
              <input
                type="text"
                value={state.brand}
                onChange={(e) => updateState('brand', e.target.value)}
                className="w-full bg-gray-900 border-2 border-gray-800 p-4 text-xl focus:border-white focus:outline-none transition-colors"
                placeholder="e.g. BMW 3 Series"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-xl font-bold text-gray-400">Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['SUV', 'Saloon', 'Hatchback', 'Estate', 'Coupe'].map(type => (
                  <button
                    key={type}
                    onClick={() => updateState('carType', type)}
                    className={`p-4 border-2 font-bold uppercase text-sm ${state.carType === type ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-400'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleNext}
              disabled={!state.brand || !state.carType}
              className="w-full bg-white text-black p-4 font-bold text-lg uppercase tracking-wider disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <h2 className="text-2xl font-bold">What do you expect for that budget?</h2>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Minimum Year</label>
              <input
                type="number"
                value={state.minYear}
                onChange={(e) => updateState('minYear', e.target.value)}
                className="w-full bg-gray-900 border-2 border-gray-800 p-4 text-xl focus:border-white focus:outline-none transition-colors"
                placeholder="e.g. 2018"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Max Mileage</label>
              <input
                type="number"
                value={state.maxMileage}
                onChange={(e) => updateState('maxMileage', e.target.value)}
                className="w-full bg-gray-900 border-2 border-gray-800 p-4 text-xl focus:border-white focus:outline-none transition-colors"
                placeholder="e.g. 60000"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Must-have Features</label>
              <input
                type="text"
                value={state.features}
                onChange={(e) => updateState('features', e.target.value)}
                className="w-full bg-gray-900 border-2 border-gray-800 p-4 text-xl focus:border-white focus:outline-none transition-colors"
                placeholder="e.g. Apple CarPlay, Leather"
              />
            </div>
            <button
              onClick={handleNext}
              disabled={!state.minYear || !state.maxMileage}
              className="w-full bg-white text-black p-4 font-bold text-lg uppercase tracking-wider disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <label className="block text-2xl font-bold">How do you actually drive most days?</label>
              <div className="grid grid-cols-1 gap-2">
                {['Short city trips', 'Mixed', 'Motorway'].map(type => (
                  <button
                    key={type}
                    onClick={() => updateState('usage', type)}
                    className={`p-4 border-2 font-bold uppercase text-sm ${state.usage === type ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-400'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Annual Mileage</label>
              <input
                type="number"
                value={state.annualMileage}
                onChange={(e) => updateState('annualMileage', e.target.value)}
                className="w-full bg-gray-900 border-2 border-gray-800 p-4 text-xl focus:border-white focus:outline-none transition-colors"
                placeholder="e.g. 10000"
              />
            </div>
            <button
              onClick={handleNext}
              disabled={!state.usage || !state.annualMileage}
              className="w-full bg-white text-black p-4 font-bold text-lg uppercase tracking-wider disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <label className="block text-2xl font-bold">Which brands would you struggle to give up?</label>
              <input
                type="text"
                value={state.brandBias}
                onChange={(e) => updateState('brandBias', e.target.value)}
                className="w-full bg-gray-900 border-2 border-gray-800 p-4 text-xl focus:border-white focus:outline-none transition-colors"
                placeholder="e.g. Audi, BMW"
              />
            </div>
            <button
              onClick={handleNext}
              disabled={!state.brandBias}
              className="w-full bg-white text-black p-4 font-bold text-lg uppercase tracking-wider disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 6 && (
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <label className="block text-2xl font-bold">What mileage feels too high to you?</label>
              <input
                type="number"
                value={state.mileageBelief}
                onChange={(e) => updateState('mileageBelief', e.target.value)}
                className="w-full bg-gray-900 border-2 border-gray-800 p-4 text-xl focus:border-white focus:outline-none transition-colors"
                placeholder="e.g. 60000"
              />
            </div>
            <button
              onClick={handleNext}
              disabled={!state.mileageBelief}
              className="w-full bg-white text-black p-4 font-bold text-lg uppercase tracking-wider disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 7 && (
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <label className="block text-2xl font-bold">If something goes wrong, how much would you realistically be okay paying for a repair?</label>
              <p className="text-gray-400 text-sm">
                Most used cars will need unexpected repairs at some point.
                This helps us avoid recommending cars that could stretch your budget.
              </p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: '£1,000+ wouldn’t be a problem', value: 'high_risk_tolerance' },
                  { label: 'Up to £500–£1,000 is manageable', value: 'medium_risk_tolerance' },
                  { label: 'Anything over £300 would be a problem', value: 'low_risk_tolerance' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateState('riskTolerance', option.value)}
                    className={`p-4 border-2 font-bold text-sm text-left ${state.riskTolerance === option.value ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-400'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              
              {state.riskTolerance === 'low_risk_tolerance' && (
                <div className="p-4 bg-gray-900 border-l-2 border-green-500 mt-4">
                  <p className="text-sm">
                    You’ve said unexpected costs would be difficult.<br/><br/>
                    We’ll prioritise cars known for lower maintenance and fewer surprises.
                  </p>
                </div>
              )}
              
              {state.riskTolerance === 'high_risk_tolerance' && (
                <div className="p-4 bg-gray-900 border-l-2 border-yellow-500 mt-4">
                  <p className="text-sm">
                    You’re comfortable handling larger repairs.<br/><br/>
                    This opens up more premium options—but with higher risk.
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleNext}
              disabled={!state.riskTolerance}
              className="w-full bg-white text-black p-4 font-bold text-lg uppercase tracking-wider disabled:opacity-50"
            >
              See Results
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function Mode1Output({ state, warningsIgnored, onBack }: { state: State, warningsIgnored: number, onBack: () => void }) {
  const [isRealistic, setIsRealistic] = useState<boolean | null>(null);
  let escalationLevel = 0;
  let escalationMessage = "";

  if (warningsIgnored >= 3) {
    escalationLevel = 3;
    escalationMessage = "You are now in high-risk territory.";
  } else if (warningsIgnored === 2) {
    escalationLevel = 2;
    escalationMessage = "Your choices increase the chance of a poor purchase.";
  } else if (warningsIgnored === 1) {
    escalationLevel = 1;
    escalationMessage = "You've ignored multiple warnings.";
  }

  let query = "used reliable car";
  if (state.riskTolerance === 'low_risk_tolerance') {
    query = "used highly reliable low maintenance car";
  } else if (state.riskTolerance === 'high_risk_tolerance') {
    query = "used premium car";
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="p-4 flex items-center border-b border-gray-800 sticky top-0 bg-black z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center font-black uppercase tracking-widest">
          Your Reality Check
        </div>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-6 max-w-md mx-auto w-full space-y-8 pb-24">
        <MarketRealityCheck state={state} onComplete={setIsRealistic} />

        {isRealistic !== null && (
          <>
            {escalationLevel > 0 && (
              <div className="bg-red-600 p-4 border-l-4 border-white flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-black uppercase text-sm tracking-widest mb-1">Warning Level {escalationLevel}</h3>
                  <p className="font-medium">{escalationMessage}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase">The Reality Check</h2>
              
              <CarCard 
                title="Your Choice"
                subtitle="What you asked for"
                car={`${state.brand} ${state.carType}`.trim() || "Unknown Car"}
                why="This is the car you are drawn to."
                tradeoffs={
                  /bmw|audi|mercedes|land rover|jaguar|porsche|range rover/i.test(state.brand)
                    ? "High maintenance, rapid depreciation, expensive parts. A risky choice at this budget."
                    : /toyota|honda|mazda|lexus|skoda|kia|hyundai/i.test(state.brand)
                    ? "Generally reliable with sensible running costs. A solid choice."
                    : "Average maintenance costs. Condition and history will be everything."
                }
                risk={
                  /bmw|audi|mercedes|land rover|jaguar|porsche|range rover/i.test(state.brand)
                    ? "High"
                    : /toyota|honda|mazda|lexus|skoda|kia|hyundai/i.test(state.brand)
                    ? "Low"
                    : "Medium"
                }
                color={
                  /bmw|audi|mercedes|land rover|jaguar|porsche|range rover/i.test(state.brand)
                    ? "border-red-600"
                    : /toyota|honda|mazda|lexus|skoda|kia|hyundai/i.test(state.brand)
                    ? "border-green-500"
                    : "border-yellow-500"
                }
                isHighRisk={/bmw|audi|mercedes|land rover|jaguar|porsche|range rover/i.test(state.brand)}
              />
            </div>

            <LiveListings 
              query={query}
              budget={parseInt(state.budget.replace(/[^0-9]/g, ''), 10) || 10000}
              originalChoice={`${state.brand} ${state.carType}`}
              title="Expert Recommendations"
              subtitle="Based on your preferences, here is our tough-love advice:"
              maxMileage={parseInt(state.maxMileage.replace(/[^0-9]/g, ''), 10) || undefined}
            />
          </>
        )}
      </main>
    </div>
  );
}

interface CarCardProps {
  title: string;
  subtitle: string;
  car: string;
  why: string;
  tradeoffs: string;
  risk: string;
  color: string;
  isHighRisk: boolean;
}

function CarCard({ title, subtitle, car, why, tradeoffs, risk, color, isHighRisk }: CarCardProps) {
  return (
    <div className={`bg-gray-900 border-l-4 ${color} p-5 space-y-4`}>
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</h3>
        <p className="text-sm text-gray-400 italic mb-2">{subtitle}</p>
        <div className="text-2xl font-black uppercase">{car}</div>
      </div>
      
      <div className="space-y-3 text-sm">
        <div>
          <span className="font-bold text-white block mb-1">Why it fits:</span>
          <span className="text-gray-400">{why}</span>
        </div>
        <div>
          <span className="font-bold text-white block mb-1">The Reality:</span>
          <span className="text-gray-400">{tradeoffs}</span>
        </div>
        <div className={`pt-2 border-t border-gray-800 font-bold ${isHighRisk ? 'text-red-500' : 'text-gray-300'}`}>
          Risk Level: {risk}
        </div>
      </div>
    </div>
  );
}
