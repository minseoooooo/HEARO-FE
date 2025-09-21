"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Volume2, VolumeX, Heart, MessageCircle, Share2, AlertCircle } from "lucide-react"
import { useLocation } from "./location-context"

interface HomeContentProps {
  setCurrentAudio: (audio: any) => void
  location?: { lat: number; lng: number } | null
  onMapAreaClick?: () => void
}

interface Post {
  id: number;                // 식별자
  distance: number;          // 유저와의 거리 (m 단위, number)
  textContent: string;       // 게시물 텍스트
  audioContentUrl?: string;  // 오디오 Presigned URL (없을 수도 있음)
  type: string;              // 게시물 타입 (예: "AUDIO", "TEXT")
}

export function HomeContent({ setCurrentAudio, onMapAreaClick }: HomeContentProps) {
  const [playingPost, setPlayingPost] = useState<number | null>(null)
  const [nearbyContent, setNearbyContent] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false)
  const { location, isKakaoMapAvailable } = useLocation()

  const fetchNearbyPosts = async () => {
    if (!location) return;

    setIsLoading(true);
    try {
      console.log("[v1] 근처 게시물 요청:", location);

      const response = await fetch("http://localhost:8080/entry/text/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
        }),
      });

      if (response.ok) {
        const posts = await response.json();
        console.log("[v0] 근처 게시물 로드 성공:", posts);
        setNearbyContent(Array.isArray(posts.textEntryRsList) ? posts.textEntryRsList : []);
      } else {
        console.error("[v0] 게시물 로드 실패:", response.status);
        setNearbyContent(getDummyPosts());
      }
    } catch (error) {
      console.error("[v0] 게시물 로드 오류:", error);
      setNearbyContent(getDummyPosts());
    } finally {
      setIsLoading(false);
    }
  }

  const getDummyPosts = (): Post[] => [
    {
      id: 1,
      type: "TEXT",
      textContent: "이 카페 진짜 분위기 좋다! 작업하기 딱이야 ☕",
      distance: 15, // ✅ number로
    },
    {
      id: 2,
      type: "TEXT",
      textContent: "여기 주차 어려워요. 근처 공영주차장 이용하세요!",
      distance: 32,
    },
    {
      id: 3,
      type: "AUDIO",
      textContent: "🎵 이 노래 좋다... (음성에서 변환됨)",
      distance: 68,
      audioContentUrl: "https://dummy-s3-url.com/audio/sample.webm", // ✅ 예시 URL
    },
  ]

  useEffect(() => {
    if (location) {
      fetchNearbyPosts()
    }
  }, [location])

  const handleTextToSpeech = async (postId: number, content: string, audioUrl?: string) => {
    if (playingPost === postId) {
      setPlayingPost(null)
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
      return;
    }

    setPlayingPost(postId);

    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl); // ✅ Presigned URL 바로 사용
        audio.onended = () => setPlayingPost(null);
        audio.onerror = () => {
          setPlayingPost(null);
          console.error("[v0] 음성 재생 실패");
        };

        await audio.play();
        return;
      } catch (error) {
        setPlayingPost(null);
        console.error("[v0] 음성 파일 로드 실패:", error);
      }
    } else {
      // audioUrl이 없으면 TTS로 읽기
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(content);
        utterance.onend = () => setPlayingPost(null);
        window.speechSynthesis.speak(utterance);
      }
    }
  }

  return (
    <div className="space-y-4 p-4 pb-6">
      <Card
        className="p-8 bg-white rounded-2xl shadow-sm border-0 cursor-pointer min-h-[120px]"
        onClick={onMapAreaClick}
        title="지도 영역을 눌러서 현재 위치를 갱신하세요"
      >
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <MapPin className="w-8 h-8 text-primary" />
          <div>
            <p className="font-semibold text-lg text-gray-900">지도 영역</p>
            <p className="text-sm text-gray-500">근처 게시물이 표시됩니다</p>
            {!isKakaoMapAvailable && (
              <div className="flex items-center justify-center space-x-1 mt-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <p className="text-xs text-amber-600">지도 API 연결 안됨 - 기본 위치 서비스 사용 중</p>
              </div>
            )}
            {location && (
              <div className="text-xs text-gray-400 mt-2 space-y-1">
                <p>
                  현재 위치: 위도 {location.lat.toFixed(6)}, 경도 {location.lng.toFixed(6)}
                </p>
                {location.address && <p>주소: {location.address}</p>}
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-bold text-gray-900">근처 게시물</h2>
          {isLoading && <span className="text-sm text-gray-500">로딩 중...</span>}
        </div>

        {nearbyContent.map((item) => (
          <Card key={item.id} className="p-4 space-y-3 bg-white rounded-2xl shadow-sm border-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-primary text-primary px-3 py-1 rounded-full">
                  {item.type}
                </span>
                <span className="text-sm text-gray-500">{item.type}</span>
                <span className="text-sm text-gray-400">• {item.distance + "m"}</span>
              </div>
              <Button
                variant="ghost"
                size="default"
                onClick={() => handleTextToSpeech(item.id, item.textContent, item.audioContentUrl)}
                className="h-10 w-10 p-0 hover:bg-pink-50 rounded-full"
                title={item.type == "AUDIO" ? "원본 음성 재생" : "텍스트 음성 변환"}
              >
                {playingPost === item.id ? (
                  <VolumeX className="w-5 h-5 text-primary" />
                ) : (
                  <Volume2 className={`w-5 h-5 ${item.type == "AUDIO" ? "text-primary" : "text-gray-400"}`} />
                )}
              </Button>
            </div>

            <p className="text-gray-900 leading-relaxed text-base">{item.textContent}</p>

            {/*<div className="flex items-center justify-between pt-2">*/}
            {/*  <div className="flex items-center space-x-6">*/}
            {/*    <button className="flex items-center space-x-1 text-gray-500 hover:text-pink-400 transition-colors">*/}
            {/*      <Heart className="w-5 h-5" />*/}
            {/*      <span className="text-sm font-medium">{item.likes}</span>*/}
            {/*    </button>*/}
            {/*    <button className="flex items-center space-x-1 text-gray-500 hover:text-pink-400 transition-colors">*/}
            {/*      <MessageCircle className="w-5 h-5" />*/}
            {/*      <span className="text-sm font-medium">{item.comments}</span>*/}
            {/*    </button>*/}
            {/*    <button className="flex items-center space-x-1 text-gray-500 hover:text-pink-400 transition-colors">*/}
            {/*      <Share2 className="w-5 h-5" />*/}
            {/*    </button>*/}
            {/*  </div>*/}
            {/*  <div className="text-right">*/}
            {/*    <p className="text-xs text-gray-400">{item.time}</p>*/}
            {/*    <p className="text-xs text-gray-400">{item.location}</p>*/}
            {/*  </div>*/}
            {/*</div>*/}
          </Card>
        ))}
      </div>
    </div>
  )
}
