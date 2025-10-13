
import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Volume2 } from 'lucide-react';

const VoiceMode = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPost, setCurrentPost] = useState('근처에서 재생 중인 음성이 없습니다');

  // Mock voice posts
  const voicePosts = [
    '이 길에서 조심하세요, 공사 중이에요',
    '맛있는 빵집 발견! 크로와상 추천합니다',
    '🎵 좋은 노래가 흘러나오네요',
    '여기 벚꽃이 정말 예뻐요'
  ];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        const randomPost = voicePosts[Math.floor(Math.random() * voicePosts.length)];
        setCurrentPost(`"${randomPost}"`);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setCurrentPost('"이 길에서 조심하세요, 공사 중이에요"');
    } else {
      setCurrentPost('근처에서 재생 중인 음성이 없습니다');
    }
  };

  return (
    <div className="voice-mode animate-fade-in">
      <div className="container max-w-md mx-auto px-8">
        {/* Main focus text */}
        <div className="text-center mb-12">
          <h1 className="voice-focus-text mb-8">
            소리에 집중하며<br />걸어볼까요? 🎧
          </h1>
          
          {isPlaying && (
            <div className="animate-pulse-gentle">
              <Volume2 className="w-8 h-8 mx-auto mb-4 text-voice-accent" />
              <p className="text-voice-text text-sm korean-text opacity-80">
                {currentPost}
              </p>
            </div>
          )}
        </div>

        {/* Audio controls */}
        <div className="flex justify-center items-center space-x-6">
          <button className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-voice-text hover:bg-white/20 transition-all duration-200">
            <SkipForward className="w-5 h-5 transform rotate-180" />
          </button>
          
          <button
            onClick={togglePlayback}
            className="p-4 rounded-full bg-gradient-to-r from-voice-accent to-secondary text-white shadow-strong hover:scale-110 transition-all duration-200"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </button>
          
          <button className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-voice-text hover:bg-white/20 transition-all duration-200">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Status indicator */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
            <div className={`w-2 h-2 rounded-full mr-2 ${isPlaying ? 'bg-green-400 animate-pulse-gentle' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-voice-text korean-text">
              {isPlaying ? '재생 중' : '일시정지'}
            </span>
          </div>
        </div>

        {/* Distance info */}
        <div className="text-center mt-6">
          <p className="text-xs text-voice-text/60 korean-text">
            반경 100m 내 음성 메시지
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceMode;
