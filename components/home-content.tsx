"use client"

import { useState, useEffect, useRef } from "react" // useRef 추가
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Volume2, VolumeX, Heart, MessageCircle, Share2, AlertCircle } from "lucide-react"
import { useLocation } from "./location-context"

interface HomeContentProps {
  // setCurrentAudio는 더 이상 필요 없으므로 제거하거나 주석 처리할 수 있습니다.
  // setCurrentAudio: (audio: any) => void 
  onMapAreaClick?: () => void
}

// API 명세에 맞는 Post 인터페이스
interface Post {
  id: number;
  distance: number;
  textContent: string;
  audioContentUrl?: string;
  type: "AUDIO" | "TEXT"; // 타입을 명확하게 지정
}

export function HomeContent({ onMapAreaClick }: HomeContentProps) {
  const [playingPostId, setPlayingPostId] = useState<number | null>(null)
  const [nearbyContent, setNearbyContent] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { location, isKakaoMapAvailable } = useLocation()
  
  // 오디오 재생을 관리하기 위한 Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchNearbyPosts = async () => {
    if (!location) return;

    setIsLoading(true);
    try {
      console.log("[v1] 근처 게시물 요청:", location);

      const response = await fetch("https://api.herehear.p-e.kr/entry/text/read", {
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
        const data = await response.json();
        const posts = Array.isArray(data.textEntryRsList) ? data.textEntryRsList : [];
        console.log("[v1] 근처 게시물 로드 성공:", posts);
        setNearbyContent(posts);
      } else {
        console.error("[v1] 게시물 로드 실패:", response.status);
        setNearbyContent([]); // 실패 시 빈 배열로 초기화
      }
    } catch (error) {
      console.error("[v1] 게시물 로드 오류:", error);
      setNearbyContent([]); // 오류 발생 시 빈 배열로 초기화
    } finally {
      setIsLoading(false);
    }
  }
  
  // 위치가 변경될 때마다 게시물을 새로 불러옵니다.
  useEffect(() => {
    if (location) {
      fetchNearbyPosts();
    }
  }, [location]);

  // 오디오 재생/중지 로직
  const handleAudioPlay = (post: Post) => {
    // 현재 재생 중인 오디오 중지
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // 다른 오디오를 재생하고 있었다면 상태 초기화
    if (playingPostId !== null && playingPostId !== post.id) {
      setPlayingPostId(null);
    }
    
    // 현재 클릭한 오디오가 이미 재생 중이면 중지
    if (playingPostId === post.id) {
      setPlayingPostId(null);
      return;
    }
    
    setPlayingPostId(post.id);

    if (post.audioContentUrl) {
      const audio = new Audio(post.audioContentUrl);
      audioRef.current = audio;

      audio.play().catch(err => {
        console.error("오디오 재생 실패:", err);
        setPlayingPostId(null);
      });
      
      audio.onended = () => {
        setPlayingPostId(null);
        audioRef.current = null;
      };
    } else {
      // 오디오 URL이 없는 텍스트 게시물은 TTS로 재생
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(post.textContent);
        utterance.lang = "ko-KR";
        utterance.onend = () => setPlayingPostId(null);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

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

        {nearbyContent.length === 0 && !isLoading && (
          <Card className="p-4 text-center text-gray-500">
            주변에 게시물이 없습니다.
          </Card>
        )}

        {nearbyContent.map((item) => (
          <Card key={item.id} className="p-4 space-y-3 bg-white rounded-2xl shadow-sm border-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-primary bg-primary-foreground px-3 py-1 rounded-full">
                  {item.type === "AUDIO" ? "음성" : "텍스트"}
                </span>
                <span className="text-sm text-gray-400">• {item.distance}m</span>
              </div>
              <Button
                variant="ghost"
                size="default"
                onClick={() => handleAudioPlay(item)}
                className="h-10 w-10 p-0 hover:bg-pink-50 rounded-full"
                title={item.type === "AUDIO" ? "음성 재생" : "음성으로 듣기"}
              >
                {playingPostId === item.id ? (
                  <VolumeX className="w-5 h-5 text-primary" />
                ) : (
                  <Volume2 className={`w-5 h-5 ${item.type === "AUDIO" ? "text-primary" : "text-gray-400"}`} />
                )}
              </Button>
            </div>

            <p className="text-gray-900 leading-relaxed text-base">{item.textContent}</p>

          </Card>
        ))}
      </div>
    </div>
  )
}