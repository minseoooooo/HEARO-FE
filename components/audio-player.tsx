"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, SkipBack, SkipForward, X } from "lucide-react"

interface AudioPlayerProps {
  audio: any
  onClose: () => void
}

export function AudioPlayer({ audio, onClose }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration] = useState(180) // 3 minutes

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-sm bg-black text-white border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs">👁</span>
                </div>
                텍스트
              </Button>
              <Button variant="default" size="sm" className="bg-primary">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xs">🎧</span>
                </div>
                음성
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-4 pb-8 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-medium">소리에 집중하며</h2>
            <h2 className="text-xl font-medium">걸어볼까요? 🎧</h2>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center justify-center space-x-6">
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
              <SkipBack className="w-6 h-6" />
            </Button>

            <Button
              size="lg"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </Button>

            <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
              <SkipForward className="w-6 h-6" />
            </Button>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{isPlaying ? "재생 중" : "일시정지"}</span>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400">반경 100m 내 음성 메시지</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
