"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface KakaoMapLoaderProps {
  children: React.ReactNode
}

export function KakaoMapLoader({ children }: KakaoMapLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fallbackMode, setFallbackMode] = useState(false)

  useEffect(() => {
    const loadKakaoMaps = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          console.log("[v0] 카카오 지도 API 로드 완료")
          setIsLoaded(true)
        })
      } else {
        // API 스크립트가 아직 로드되지 않은 경우 재시도
        const checkInterval = setInterval(() => {
          if (window.kakao && window.kakao.maps) {
            clearInterval(checkInterval)
            window.kakao.maps.load(() => {
              console.log("[v0] 카카오 지도 API 로드 완료")
              setIsLoaded(true)
            })
          }
        }, 100)

        setTimeout(() => {
          clearInterval(checkInterval)
          if (!isLoaded) {
            console.log("[v0] 카카오 지도 API 로드 실패 - fallback 모드로 전환")
            setFallbackMode(true)
            setIsLoaded(true) // 앱이 계속 동작하도록 설정
          }
        }, 5000)
      }
    }

    loadKakaoMaps()
  }, [isLoaded])

  if (!isLoaded && !fallbackMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">앱을 로딩하는 중...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
