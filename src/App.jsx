import React, { useState } from 'react';
import Header from './components/Header';
import Timer from './components/Timer';

function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Header onSettingsClick={() => setShowSettings(true)} />
        
        <main className="mt-8">
          <Timer />
        </main>
      </div>
    </div>
  );
}

export default App; 