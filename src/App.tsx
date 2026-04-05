/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Home } from './components/Home';
import { Mode1 } from './components/Mode1';
import { Mode2 } from './components/Mode2';

type AppMode = 'home' | 'mode1' | 'mode2';

export default function App() {
  const [mode, setMode] = useState<AppMode>('home');

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white font-sans antialiased">
      {mode === 'home' && <Home onSelectMode={setMode} />}
      {mode === 'mode1' && <Mode1 onBack={() => setMode('home')} />}
      {mode === 'mode2' && <Mode2 onBack={() => setMode('home')} />}
    </div>
  );
}
