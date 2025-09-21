"use client"

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
import { Home, Headphones, Clock, User, AlertCircle } from "lucide-react"

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<"onboarding" | "home" | "listen" | "timeline" | "profile">(
    "onboarding",
  )
  const [currentAudio, setCurrentAudio] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const { location, updateLocation, isKakaoMapAvailable } = useLocation()

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true)
    setCurrentScreen("home")
  }

  const handleMapAreaClick = () => {
    updateLocation()
  }

  // 온보딩 화면
  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  // 오디오 플레이어 모달
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
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Hear & Here</h1>
              {!isKakaoMapAvailable && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 text-amber-500" />
                  <p className="text-xs text-amber-600">지도 API 연결 안됨</p>
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-pink-400 hover:bg-pink-500 text-white rounded-full px-6"
          >
            새 게시물
          </Button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="pt-20 pb-20">
        {currentScreen === "home" && (
          <HomeContent setCurrentAudio={setCurrentAudio} location={location} onMapAreaClick={handleMapAreaClick} />
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <span className="text-gray-900">모드</span>
                    <span className="text-primary">시각 모드 ›</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <span className="text-gray-900">글자 크기</span>
                    <span className="text-primary">16px ›</span>
                  </div>
                </div>
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
