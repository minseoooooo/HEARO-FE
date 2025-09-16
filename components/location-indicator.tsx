"use client"

import { useRef, useState } from "react"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Navigation, RefreshCw } from "lucide-react"

declare global {
  interface Window {
    kakao: any
  }
}

interface LocationInfo {
  latitude: number
  longitude: number
  address?: string
}

export default function MainApp() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [location, setLocation] = useState<LocationInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  // 카카오 지도 로드 완료 핸들러
  const handleScriptLoad = () => {
    window.kakao.maps.load(() => {
      setIsScriptLoaded(true)
      if (mapContainer.current && !map) {
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 시청 기본 좌표
          level: 3,
        }
        const kakaoMap = new window.kakao.maps.Map(mapContainer.current, options)
        setMap(kakaoMap)
      }
    })
  }

  // 위치 받아오고 지도 및 마커 설정, 서버 전송
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("이 브라우저는 위치 서비스를 지원하지 않습니다.")
      return
    }
    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ latitude, longitude })

        if (map) {
          // 지도 중심 이동
          const moveLatLon = new window.kakao.maps.LatLng(latitude, longitude)
          map.setCenter(moveLatLon)

          // 기존 마커 제거
          if (marker) marker.setMap(null)

          // 새 마커 생성
          const newMarker = new window.kakao.maps.Marker({
            position: moveLatLon,
            map,
          })
          setMarker(newMarker)

          // 인포윈도우 생성
          const infoWindow = new window.kakao.maps.InfoWindow({
            content: `
              <div style="padding:10px; font-size:12px; text-align:center;">
                <strong>현재 위치</strong><br/>
                위도: ${latitude.toFixed(6)}<br/>
                경도: ${longitude.toFixed(6)}
              </div>
            `,
          })
          infoWindow.open(map, newMarker)

          // 주소 변환
          getAddressFromCoords(latitude, longitude)
          // 서버 전송
          sendLocationToServer(latitude, longitude)
        }

        setLoading(false)
      },
      (error) => {
        let msg = "위치를 가져올 수 없습니다."
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "위치 접근 권한이 거부되었습니다. 권한 설정을 확인하세요."
            break
          case error.POSITION_UNAVAILABLE:
            msg = "위치 정보를 사용할 수 없습니다."
            break
          case error.TIMEOUT:
            msg = "위치 요청 시간이 초과되었습니다."
            break
        }
        setError(msg)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    )
  }

  // 좌표 -> 주소 변환
  const getAddressFromCoords = (lat: number, lng: number) => {
    if (!window.kakao?.maps?.services) return
    const geocoder = new window.kakao.maps.services.Geocoder()
    const coord = new window.kakao.maps.LatLng(lat, lng)

    geocoder.coord2Address(coord.getLng(), coord.getLat(), (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const address = result[0]?.address?.address_name || "주소를 찾을 수 없습니다."
        setLocation((prev) => (prev ? { ...prev, address } : null))
      }
    })
  }

  // 서버에 위치 전송
  const sendLocationToServer = async (lat: number, lng: number) => {
    try {
      const res = await fetch("https://api.herehear.p-e.kr/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      })
      if (!res.ok) throw new Error(`서버 응답 오류: ${res.status}`)
    } catch (e) {
      console.error("서버 전송 실패", e)
    }
  }

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services`}
        strategy="beforeInteractive"
        onLoad={handleScriptLoad}
        onError={() => setError("카카오 지도 로드 실패")}
      />

      <div className="space-y-6 p-4 max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              위치 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={getCurrentLocation} disabled={loading || !isScriptLoaded} className="w-full">
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  위치 가져오는 중...
                </>
              ) : (
                <>
                  <Navigation className="mr-2 h-4 w-4" />
                  현재 위치 찾기
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {location && (
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">위도:</span> {location.latitude.toFixed(6)}
                  </div>
                  <div>
                    <span className="font-medium">경도:</span> {location.longitude.toFixed(6)}
                  </div>
                </div>
                {location.address && (
                  <div>
                    <span className="font-medium">주소:</span> {location.address}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div ref={mapContainer} className="w-full h-[500px] rounded-lg min-h-[500px]" />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
