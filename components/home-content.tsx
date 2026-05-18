"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Volume2, VolumeX, Heart, MessageCircle, Share2, AlertCircle } from "lucide-react"
import { useLocation } from "./location-context"
import { fetchApi } from "@/lib/api" // API 호출을 위해 fetchApi를 임포트합니다.
import { useAuth } from "./auth-context" // 인증 상태 확인을 위해 useAuth를 임포트합니다.

interface HomeContentProps {
    onMapAreaClick?: () => void
}

// Post 인터페이스에 좋아요, 댓글, 사용자 좋아요 여부 필드를 추가합니다.
interface Post {
    id: number;
    distance: number;
    textContent: string;
    audioContentUrl?: string;
    type: "AUDIO" | "TEXT";
    likeCount: number;      // 좋아요 수
    commentCount: number;   // 댓글 수
    isLiked: boolean;       // 현재 사용자의 좋아요 여부
}

export function HomeContent({ onMapAreaClick }: HomeContentProps) {
    const [playingPostId, setPlayingPostId] = useState<number | null>(null)
    const [nearbyContent, setNearbyContent] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { location, isKakaoMapAvailable } = useLocation()
    const { isAuthenticated } = useAuth()
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 주변 게시물을 불러오는 함수
    const fetchNearbyPosts = async () => {
        if (!location) return
        setIsLoading(true)
        try {
            // 로그인 상태일 때만 API를 호출합니다.
            if (isAuthenticated) {
                console.log("[v1] 근처 게시물 요청:", location);

                const response = await fetchApi("https://hearo-docker-production.up.railway.app/entry/text/read", {
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
                }
            }
        } catch (error) {
            console.error("게시물 로드 중 오류:", error);
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        // 위치 정보와 로그인 상태가 모두 준비되면 게시물을 불러옵니다.
        if (location && isAuthenticated) {
            fetchNearbyPosts();
        }
    }, [location, isAuthenticated]);

    // 좋아요 버튼 클릭 핸들러
    const handleLikePost = async (postId: number) => {
        // UI 즉시 업데이트 (낙관적 업데이트)
        const originalContent = [...nearbyContent];
        const updatedContent = nearbyContent.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    isLiked: !post.isLiked,
                    likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
                };
            }
            return post;
        });
        setNearbyContent(updatedContent);

        // 서버에 좋아요 API 요청
        try {
            const response = await fetchApi(`https://hearo-docker-production.up.railway.app/posts/${postId}/likes`, {
                method: 'POST',
            });

            if (!response.ok) {
                // 요청 실패 시 UI를 원래 상태로 되돌립니다.
                alert("좋아요 처리에 실패했습니다.");
                setNearbyContent(originalContent);
            }
        } catch (error) {
            console.error("좋아요 API 오류:", error);
            alert("좋아요 처리에 실패했습니다.");
            setNearbyContent(originalContent);
        }
    };

    // 댓글 버튼 클릭 핸들러
    const handleCommentPost = (postId: number) => {
        alert(`게시물 #${postId}에 대한 댓글 기능은 현재 준비 중입니다.`);
    };


    const handleAudioPlay = (post: Post) => {
        // ... (기존 오디오 재생 로직은 그대로 유지)
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
                                <span className="text-sm text-gray-400">• {item.distance} km</span>
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

                        {/* 좋아요/댓글 UI 및 기능 활성화 */}
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center space-x-6">
                                <button
                                    className="flex items-center space-x-1 text-gray-500 hover:text-pink-400 transition-colors"
                                    onClick={() => handleLikePost(item.id)}
                                >
                                    <Heart
                                        className={`w-5 h-5 ${item.isLiked ? 'text-pink-400' : ''}`}
                                        fill={item.isLiked ? 'currentColor' : 'none'}
                                    />
                                    <span className="text-sm font-medium">{item.likeCount}</span>
                                </button>
                                <button
                                    className="flex items-center space-x-1 text-gray-500 hover:text-blue-400 transition-colors"
                                    onClick={() => handleCommentPost(item.id)}
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">{item.commentCount}</span>
                                </button>
                                <button className="flex items-center space-x-1 text-gray-500 hover:text-green-400 transition-colors">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}