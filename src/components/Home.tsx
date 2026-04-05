import { AlertTriangle, Car, ShieldAlert } from 'lucide-react';

interface HomeProps {
  onSelectMode: (mode: 'mode1' | 'mode2') => void;
}

export function Home({ onSelectMode }: HomeProps) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-6">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-red-600 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-none uppercase">
            Don't Buy<br />That Car
          </h1>
          <p className="text-xl font-medium text-gray-400">
            Most people regret their car purchase. We stop that.
          </p>
          <p className="text-sm text-gray-500 border-l-2 border-red-600 pl-3">
            We will challenge your choices. That's the point.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onSelectMode('mode1')}
            className="w-full bg-white text-black p-6 rounded-none font-bold text-lg flex items-center justify-between hover:bg-gray-200 transition-colors active:scale-[0.98]"
          >
            <div className="flex flex-col items-start">
              <span className="uppercase tracking-widest text-xs text-gray-500 mb-1">Mode 1</span>
              <span>Find the Right Car</span>
            </div>
            <Car className="w-6 h-6" />
          </button>

          <button
            onClick={() => onSelectMode('mode2')}
            className="w-full border-2 border-white text-white p-6 rounded-none font-bold text-lg flex items-center justify-between hover:bg-white hover:text-black transition-colors active:scale-[0.98]"
          >
            <div className="flex flex-col items-start">
              <span className="uppercase tracking-widest text-xs text-gray-400 mb-1">Mode 2</span>
              <span>Check This Car</span>
            </div>
            <ShieldAlert className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
