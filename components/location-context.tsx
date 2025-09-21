"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface LocationData {
  lat: number
  lng: number
  address?: string
  timestamp: Date
}

interface LocationContextType {
  location: LocationData | null
  isLoading: boolean
  error: string | null
  updateLocation: () => Promise<void>
  sendLocationToServer: (locationData: LocationData) => Promise<void>
  isKakaoMapAvailable: boolean
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isKakaoMapAvailable, setIsKakaoMapAvailable] = useState(false)

  // 카맵 api 연동 확인용
  useEffect(() => {
    console.log("현재 로드된 카카오맵 API 키:", process.env.NEXT_PUBLIC_KAKAO_MAP_KEY);
  }, []);

  useEffect(() => {
    const checkKakaoMap = () => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        setIsKakaoMapAvailable(true)
        console.log("[v0] 카카오 지도 API 사용 가능")
      } else {
        setIsKakaoMapAvailable(false)
        console.log("[v0] 카카오 지도 API 사용 불가 - 기본 위치 서비스만 사용")
      }
    }

    checkKakaoMap()
    const interval = setInterval(checkKakaoMap, 1000)
    setTimeout(() => clearInterval(interval), 10000)
  }, [])

  const sendLocationToServer = async (locationData: LocationData) => {
    try {
      console.log("[v0] 위치 정보 전송 시도:", locationData)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch("https://api.herehear.p-e.kr/user/location", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          latitude: locationData.lat,
          longitude: locationData.lng,
        }),
        signal: controller.signal,
        mode: "cors",
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        console.log("[v0] 위치 정보 전송 성공")
        // const result = await response.json()
        // console.log("[v0] 서버 응답:", result)
      } else {
        console.error("[v0] 서버 응답 오류:", response.status, response.statusText)
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.error("[v0] API 요청 타임아웃")
      } else if (error.message === "Failed to fetch") {
        console.error("[v0] 네트워크 연결 오류 - API 서버에 접근할 수 없습니다")
      } else {
        console.error("[v0] API 전송 중 예상치 못한 오류:", error)
      }
    }
  }

  const updateLocation = async () => {
    if (!navigator.geolocation) {
      setError("이 브라우저는 위치 서비스를 지원하지 않습니다.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5분 캐시
        })
      })

      const { latitude, longitude } = position.coords
      const locationData: LocationData = {
        lat: latitude,
        lng: longitude,
        timestamp: new Date(),
      }

      if (isKakaoMapAvailable && window.kakao && window.kakao.maps && window.kakao.maps.services) {
        try {
          const geocoder = new window.kakao.maps.services.Geocoder()
          const coord = new window.kakao.maps.LatLng(latitude, longitude)

          geocoder.coord2Address(coord.getLng(), coord.getLat(), (result: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const address = result[0]?.address?.address_name || "주소를 찾을 수 없습니다"
              locationData.address = address
              console.log("[v0] 주소 변환 성공:", address)
            } else {
              locationData.address = `위도: ${latitude.toFixed(6)}, 경도: ${longitude.toFixed(6)}`
              console.log("[v0] 주소 변환 실패 - 좌표 사용")
            }
            setLocation(locationData)
          })
        } catch (error) {
          console.error("[v0] 주소 변환 중 오류:", error)
          locationData.address = `위도: ${latitude.toFixed(6)}, 경도: ${longitude.toFixed(6)}`
          setLocation(locationData)
        }
      } else {
        locationData.address = `위도: ${latitude.toFixed(6)}, 경도: ${longitude.toFixed(6)}`
        console.log("[v0] 카카오 지도 API 없이 위치 정보 설정:", locationData)
        setLocation(locationData)
      }

      await sendLocationToServer(locationData)
    } catch (error) {
      console.error("[v0] 위치 가져오기 실패:", error)
      const defaultLocation: LocationData = {
        lat: 37.5665,
        lng: 126.978,
        address: "서울특별시 중구 (기본 위치)",
        timestamp: new Date(),
      }
      setLocation(defaultLocation)
      console.log("[v0] 기본 위치 사용:", defaultLocation)
      setError("위치 정보를 가져올 수 없어 기본 위치를 사용합니다.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    updateLocation()
  }, [])

  return (
    <LocationContext.Provider
      value={{
        location,
        isLoading,
        error,
        updateLocation,
        sendLocationToServer,
        isKakaoMapAvailable,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider")
  }
  return context
}
