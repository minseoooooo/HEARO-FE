
import React, { useState } from 'react';
import ModeToggle from '../components/ModeToggle';
import TextMode from '../components/TextMode';
import VoiceMode from '../components/VoiceMode';

const Index = () => {
  const [currentMode, setCurrentMode] = useState<'text' | 'voice'>('text');

  return (
    <div className="min-h-screen bg-background">
      {/* Mode Toggle */}
      <ModeToggle currentMode={currentMode} onModeChange={setCurrentMode} />
      
      {/* Mode Content */}
      {currentMode === 'text' ? <TextMode /> : <VoiceMode />}
    </div>
  );
};

export default Index;
