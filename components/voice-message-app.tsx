"use client"

import Link from "next/link" // Link 임포트 추가
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { OnboardingFlow } from "./onboarding-flow"
import { AudioPlayer } from "./audio-player"
import { HomeContent } from "./home-content"
import { GeofencingListener } from "./geofencing-listener"
import { CreateContentModal } from "./create-content-modal"
import { PersonalTimeline } from "./personal-timeline"
import { LocationProvider, useLocation } from "./location-context"
import { KakaoMapLoader } from "./kakao-map-loader"
import { Home, Headphones, Clock, User, AlertCircle, Type } from "lucide-react"
import Image from "next/image"
import { AccessibilityProvider, useAccessibility } from "./accessibility-context"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/components/auth-context";

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<"onboarding" | "home" | "listen" | "timeline" | "profile">(
    "home",
  )

  const [currentAudio, setCurrentAudio] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true)
  const { location, updateLocation, isKakaoMapAvailable } = useLocation()
  const { fontSize, setFontSize, fontSizes } = useAccessibility()
  const { isAuthenticated, logout } = useAuth();

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true)
    setCurrentScreen("home")
  }

  const handleMapAreaClick = () => {
    updateLocation()
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  if (currentAudio) {
    return <AudioPlayer audio={currentAudio} onClose={() => setCurrentAudio(null)} />
  }

    if (showCreateModal) {
        return <CreateContentModal onClose={() => setShowCreateModal(false)} />
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="fixed top-0 left-0 right-0 bg-white z-10 px-4 py-4 border-b">
                <div className="flex items-center justify-between">
                    {/* 왼쪽 로고 + 지도 상태 */}
                    <div className="flex items-center gap-3">
                        <Image
                            src="/logo.svg"
                            alt="로고"
                            width={35}
                            height={35}
                            priority
                        />
                        {!isKakaoMapAvailable && (
                            <div className="flex items-center space-x-1">
                                <AlertCircle className="w-3 h-3 text-amber-500" />
                                <p className="text-xs text-amber-600">지도 API 연결 안됨</p>
                            </div>
                        )}
                    </div>

                    {/* 오른쪽 버튼 영역 수정 */}
                    <div className="flex items-center gap-2">
                      {isAuthenticated ? (
                        <Button variant="outline" onClick={logout}>로그아웃</Button>
                      ) : (
                        <Link href="/auth">
                          <Button variant="outline">로그인</Button>
                        </Link>
                      )}
                      <Button
                        onClick={() => setShowCreateModal(true)}
                        className="text-white rounded-full px-6"
                      >
                        새 게시물
                      </Button>
                    </div>
                </div>
            </div>

      <div className="pt-20 pb-20">
        {currentScreen === "home" && (
          <HomeContent onMapAreaClick={handleMapAreaClick} />
        )}

        {currentScreen === "listen" && <GeofencingListener />}

        {currentScreen === "timeline" && <PersonalTimeline />}

        {currentScreen === "profile" && (
          <div className="p-4">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">익명 사용자</h2>
              <p className="text-gray-600">레벨 2 · 가입 30일</p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">접근성 설정</h3>
                <Card className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Type className="w-5 h-5 text-primary" />
                            <span className="font-medium">글자 크기</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{fontSizes[fontSize].name}</span>
                    </div>
                    <Slider
                        value={[fontSize]}
                        onValueChange={(value) => setFontSize(value[0])}
                        min={0}
                        max={fontSizes.length - 1}
                        step={1}
                        className="w-full"
                    />
                     <div className="flex justify-between text-xs text-muted-foreground px-1">
                        <span>가</span>
                        <span>가</span>
                    </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around py-2">
          <button
            onClick={() => setCurrentScreen("home")}
            className={`flex flex-col items-center py-2 px-4 ${
              currentScreen === "home" ? "text-primary" : "text-gray-600"
            }`}
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs">홈</span>
          </button>
          <button
            onClick={() => setCurrentScreen("listen")}
            className={`flex flex-col items-center py-2 px-4 ${
              currentScreen === "listen" ? "text-primary" : "text-gray-600"
            }`}
          >
            <Headphones className="w-6 h-6 mb-1" />
            <span className="text-xs">듣기</span>
          </button>
          <button
            onClick={() => setCurrentScreen("timeline")}
            className={`flex flex-col items-center py-2 px-4 ${
              currentScreen === "timeline" ? "text-primary" : "text-gray-600"
            }`}
          >
            <Clock className="w-6 h-6 mb-1" />
            <span className="text-xs">타임라인</span>
          </button>
          <button
            onClick={() => setCurrentScreen("profile")}
            className={`flex flex-col items-center py-2 px-4 ${
              currentScreen === "profile" ? "text-primary" : "text-gray-600"
            }`}
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs">프로필</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VoiceMessageApp() {
  return (
    <KakaoMapLoader>
      <LocationProvider>
        <AppContent />
      </LocationProvider>
    </KakaoMapLoader>
  )
}