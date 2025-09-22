"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Volume2, VolumeX, Heart, MessageCircle, Share2, AlertCircle } from "lucide-react"
import { useLocation } from "./location-context"

interface HomeContentProps {
  onMapAreaClick?: () => void
}

// 1. Post 인터페이스에 likes와 comments 추가 (주석 처리됨)
interface Post {
  id: number;
  distance: number;
  textContent: string;
  audioContentUrl?: string;
  type: "AUDIO" | "TEXT";
  // likes?: number;
  // comments?: number;
}

export function HomeContent({ onMapAreaClick }: HomeContentProps) {
  const [playingPostId, setPlayingPostId] = useState<number | null>(null)
  const [nearbyContent, setNearbyContent] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { location, isKakaoMapAvailable } = useLocation()
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 2. 좋아요 상태를 관리하는 Set 추가 (주석 처리됨)
  // const [likedPosts, setLikedPosts] = useState(new Set<number>());

  const fetchNearbyPosts = async () => {
    // ... (기존과 동일한 fetch 로직)
  }
  
  useEffect(() => {
    if (location) {
      fetchNearbyPosts();
    }
  }, [location]);
  
  // 3. 좋아요 및 댓글 핸들러 함수 추가 (주석 처리됨)
  // const handleLikePost = (postId: number) => {
  //   const newLikedPosts = new Set(likedPosts);
  //   const isLiked = newLikedPosts.has(postId);

  //   // UI 즉시 업데이트 (Optimistic Update)
  //   const updatedContent = nearbyContent.map(post => {
  //     if (post.id === postId) {
  //       const currentLikes = post.likes || 0;
  //       return { ...post, likes: isLiked ? currentLikes - 1 : currentLikes + 1 };
  //     }
  //     return post;
  //   });
  //   setNearbyContent(updatedContent);

  //   // 좋아요 상태 토글
  //   if (isLiked) {
  //     newLikedPosts.delete(postId);
  //   } else {
  //     newLikedPosts.add(postId);
  //   }
  //   setLikedPosts(newLikedPosts);

  //   // TODO: 나중에 여기에 서버로 좋아요 API 요청을 보내는 로직 추가
  //   console.log(`Post ${postId} like toggled. New state: ${!isLiked}`);
  // };

  // const handleCommentPost = (postId: number) => {
  //   // TODO: 댓글 입력 모달을 열거나, 댓글 페이지로 이동하는 로직 추가
  //   alert(`게시물 #${postId}에 대한 댓글 기능 구현 예정입니다.`);
  // };


  const handleAudioPlay = (post: Post) => {
    // ... (기존과 동일한 오디오 재생 로직)
  };

  return (
    <div className="space-y-4 p-4 pb-6">
      {/* ✅ 이 부분이 복구되었습니다. */}
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

            {/* 4. 좋아요/댓글 UI 및 기능 연결 (주석 처리됨) */}
            {/*
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-6">
                <button 
                  className="flex items-center space-x-1 text-gray-500 hover:text-pink-400 transition-colors"
                  onClick={() => handleLikePost(item.id)}
                >
                  <Heart 
                    className={`w-5 h-5 ${likedPosts.has(item.id) ? 'text-pink-400' : ''}`} 
                    fill={likedPosts.has(item.id) ? 'currentColor' : 'none'}
                  />
                  <span className="text-sm font-medium">{item.likes || 0}</span>
                </button>
                <button 
                  className="flex items-center space-x-1 text-gray-500 hover:text-blue-400 transition-colors"
                  onClick={() => handleCommentPost(item.id)}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.comments || 0}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-green-400 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            */}
          </Card>
        ))}
      </div>
    </div>
  )
}