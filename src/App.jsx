import React, { useState } from 'react';
import Timer from './components/Timer';
import Header from './components/Header';
import Settings from './components/Settings';
import { ThemeProvider } from './context/ThemeContext';
import { TimerProvider } from './context/TimerContext';

function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <ThemeProvider>
      <TimerProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
          <div className="container mx-auto px-4 py-8">
            <Header onSettingsClick={() => setShowSettings(true)} />
            
            <main className="mt-8">
              <Timer />
            </main>

            {showSettings && (
              <Settings 
                isOpen={showSettings} 
                onClose={() => setShowSettings(false)} 
              />
            )}
          </div>
        </div>
      </TimerProvider>
    </ThemeProvider>
  );
}

export default App; 