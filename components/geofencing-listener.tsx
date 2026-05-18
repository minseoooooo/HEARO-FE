"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { MapPin, Volume2, VolumeX, AlertCircle } from "lucide-react"
import { useLocation } from "./location-context"
import {fetchApi} from "@/lib/api";

interface VoiceMessage {
  id: number
  content: string
  location: string
  type: string
  timestamp: string
  audioUrl?: string
  distance?: string
  duration?: string
}

export function GeofencingListener() {
  const [isListening, setIsListening] = useState(false)
  const [currentRadius, setCurrentRadius] = useState(100)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
  const [nearbyVoiceMessages, setNearbyVoiceMessages] = useState<VoiceMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { location, isKakaoMapAvailable } = useLocation()

  // ✅ SSE 연결
  useEffect(() => {
    if (!isListening || !location) return

    console.log("[v1] SSE 연결 시작:", location, "반경:", currentRadius)

    const es = new EventSource(
        `https://hearo-docker-production.up.railway.app/sse?latitude=${location.lat}&longitude=${location.lng}&radius=${currentRadius}`
    )

    es.onopen = () => console.log("[v1] SSE 연결 성공")
    es.onerror = (err) => {
      console.error("[v1] SSE 오류:", err)
      es.close()
    }

    es.addEventListener("audio", (event: MessageEvent) => {
      try {
        const audioMessage: VoiceMessage = JSON.parse(event.data)
        console.log("[v1] 새 메시지 수신:", audioMessage)

        // 기존 목록에 누적
        setNearbyVoiceMessages((prev) => [audioMessage, ...prev])

        // 자동 재생
        if (audioMessage.audioUrl) {
          const audio = new Audio(audioMessage.audioUrl)
          audio.play().catch((err) => console.error("[v1] 자동재생 실패:", err))
        }
      } catch (e) {
        console.error("[v1] JSON 파싱 실패:", e)
      }
    })

    return () => {
      console.log("[v1] SSE 연결 종료")
      es.close()
    }
  }, [isListening, location, currentRadius])

  // ✅ 기존 fetch는 초기 로드나 fallback 용
  const fetchNearbyVoiceMessages = async () => {
    if (!location) return
    setIsLoading(true)
    try {
      const res = await fetchApi(
          `https://hearo-docker-production.up.railway.app/posts/voice/nearby?lat=${location.lat}&lng=${location.lng}&radius=${currentRadius}&type=voice`
      )
      if (res.ok) {
        const data = await res.json()
        setNearbyVoiceMessages(data)
      }
    } catch (err) {
      console.error("[v1] 초기 메시지 로드 실패:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayMessage = async (messageId: number, content: string, audioUrl?: string) => {
    if (currentlyPlaying === messageId) {
      setCurrentlyPlaying(null)
      window.speechSynthesis.cancel()
    } else {
      setCurrentlyPlaying(messageId)

      if (audioUrl) {
        const audio = new Audio(audioUrl)
        audio.onended = () => setCurrentlyPlaying(null)
        await audio.play().catch((err) => {
          console.error("[v1] 음성 재생 실패:", err)
          setCurrentlyPlaying(null)
        })
        return
      }

      // TTS fallback
      const utterance = new SpeechSynthesisUtterance(content)
      utterance.lang = "ko-KR"
      utterance.rate = 0.9
      utterance.onend = () => setCurrentlyPlaying(null)
      utterance.onerror = () => setCurrentlyPlaying(null)
      window.speechSynthesis.speak(utterance)
    }
  }


  return (
    <div className="space-y-6 p-4">
      <Card className="p-6 bg-white rounded-2xl shadow-sm border-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-lg font-bold text-gray-900">지오펜싱 듣기 모드</h2>
                <p className="text-sm text-gray-500">반경 {currentRadius}m 내 음성 메시지 자동 재생</p>
                {!isKakaoMapAvailable && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                    <p className="text-xs text-amber-600">지도 API 연결 안됨</p>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <Button
                onClick={() => {
                  setIsListening(!isListening)
                  if (!isListening) {
                    fetchNearbyVoiceMessages()
                  }
                }}
                variant={isListening ? "default" : "outline"}
                className={isListening ? "bg-pink-400 hover:bg-pink-500" : ""}
                disabled={!location}
              >
                {isListening ? "듣기 중지" : "듣기 시작"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">감지 반경</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Slider
                  value={[currentRadius]}
                  onValueChange={(value) => setCurrentRadius(value[0])}
                  max={200}
                  min={50}
                  step={25}
                  className="w-full"
                />
              </div>
              <span className="text-lg font-bold text-primary min-w-[60px] text-right">{currentRadius}m</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-bold text-gray-900">근처 음성 메시지</h3>
          {isLoading && <span className="text-sm text-gray-500">로딩 중...</span>}
        </div>

        {nearbyVoiceMessages.map((message) => (
          <Card key={message.id} className="p-4 space-y-3 bg-white rounded-2xl shadow-sm border-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
                  {message.type}
                </span>
                <span className="text-sm text-gray-500">• {message.distance}</span>
                <span className="text-sm text-gray-500">• {message.duration}</span>
              </div>
              <Button
                variant="ghost"
                size="default"
                onClick={() => handlePlayMessage(message.id, message.content, message.audioUrl)}
                className="h-10 w-10 p-0 hover:bg-pink-50 rounded-full"
              >
                {currentlyPlaying === message.id ? (
                  <VolumeX className="w-5 h-5 text-primary" />
                ) : (
                  <Volume2 className="w-5 h-5 text-primary" />
                )}
              </Button>
            </div>

            <p className="text-gray-900 font-medium leading-relaxed text-base">{message.content}</p>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-gray-500 font-medium">{message.location}</p>
              <p className="text-xs text-gray-400">{message.timestamp}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
