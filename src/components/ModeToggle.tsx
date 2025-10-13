
import React from 'react';
import { Eye, Headphones } from 'lucide-react';

interface ModeToggleProps {
  currentMode: 'text' | 'voice';
  onModeChange: (mode: 'text' | 'voice') => void;
}

const ModeToggle = ({ currentMode, onModeChange }: ModeToggleProps) => {
  return (
    <div className="mode-toggle">
      <div className="flex rounded-full bg-white">
        <button
          onClick={() => onModeChange('text')}
          className={`flex items-center px-4 py-2 rounded-full transition-all duration-200 ${
            currentMode === 'text'
              ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-soft'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Eye className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium korean-text">텍스트</span>
        </button>
        <button
          onClick={() => onModeChange('voice')}
          className={`flex items-center px-4 py-2 rounded-full transition-all duration-200 ${
            currentMode === 'voice'
              ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-soft'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Headphones className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium korean-text">음성</span>
        </button>
      </div>
    </div>
  );
};

export default ModeToggle;
