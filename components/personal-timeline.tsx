"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Play, Clock, Heart, MessageCircle, Map, Volume2, VolumeX, AlertCircle } from "lucide-react"
import { useLocation } from "./location-context"

interface TimelineRecord {
  id: number
  type: "created" | "listened"
  title: string
  content: string
  location: string
  date: string
  time: string
  likes?: number
  comments?: number
  duration?: string
  coordinates: { lat: number; lng: number }
  audioUrl?: string
}

interface TimelineStats {
  createdCount: number
  listenedCount: number
}

export function PersonalTimeline() {
  const [viewMode, setViewMode] = useState("timeline")
  const [records, setRecords] = useState<TimelineRecord[]>([])
  const [stats, setStats] = useState<TimelineStats>({ createdCount: 0, listenedCount: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [playingRecord, setPlayingRecord] = useState<number | null>(null)
  const { location } = useLocation()

  const fetchTimelineData = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] 타임라인 데이터 요청")

      const response = await fetch("https://api.herehear.p-e.kr/user/timeline", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        mode: "cors",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] 타임라인 데이터 로드 성공:", data)
        setRecords(data.records || [])
        setStats(data.stats || { createdCount: 0, listenedCount: 0 })
      } else {
        console.error("[v0] 타임라인 데이터 로드 실패:", response.status)
        // 실패 시 더미 데이터 사용
        setRecords(getDummyRecords())
        setStats({ createdCount: 24, listenedCount: 156 })
      }
    } catch (error) {
      console.error("[v0] 타임라인 데이터 로드 오류:", error)
      // 오류 시 더미 데이터 사용
      setRecords(getDummyRecords())
      setStats({ createdCount: 24, listenedCount: 156 })
    } finally {
      setIsLoading(false)
    }
  }

  const getDummyRecords = (): TimelineRecord[] => [
    {
      id: 1,
      type: "created",
      title: "강남역 근처 맛집 추천",
      content: "이 카페 진짜 분위기 좋다! 작업하기 딱이야",
      location: location?.address || "강남역 2번 출구",
      date: "2024-09-13",
      time: "14:30",
      likes: 12,
      comments: 3,
      coordinates: { lat: 37.498, lng: 127.028 },
    },
    {
      id: 2,
      type: "listened",
      title: "여행 이야기",
      content: "제주도 여행 후기를 들었어요",
      location: location?.address || "홍대입구역",
      date: "2024-09-12",
      time: "19:45",
      duration: "5분 30초",
      coordinates: { lat: 37.557, lng: 126.924 },
    },
    {
      id: 3,
      type: "created",
      title: "오늘의 기분",
      content: "🎵 좋은 음악 추천 (음성 게시물)",
      location: location?.address || "신촌역 근처",
      date: "2024-09-11",
      time: "16:20",
      likes: 8,
      comments: 1,
      coordinates: { lat: 37.555, lng: 126.936 },
      audioUrl: "voice_sample.webm",
    },
    {
      id: 4,
      type: "listened",
      title: "운동 팁",
      content: "헬스장에서 들은 운동 루틴 설명",
      location: location?.address || "역삼역",
      date: "2024-09-10",
      time: "07:30",
      duration: "3분 15초",
      coordinates: { lat: 37.5, lng: 127.036 },
    },
  ]

  useEffect(() => {
    fetchTimelineData()
  }, [])

  const handlePlayAudio = async (recordId: number, content: string, audioUrl?: string) => {
    if (playingRecord === recordId) {
      setPlayingRecord(null)
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    } else {
      setPlayingRecord(recordId)

      // 음성 파일이 있으면 서버에서 다운로드하여 재생
      if (audioUrl) {
        try {
          const response = await fetch(`https://api.herehear.p-e.kr/audio/${audioUrl}`, {
            mode: "cors",
          })
          if (response.ok) {
            const audioBlob = await response.blob()
            const audioObjectUrl = URL.createObjectURL(audioBlob)
            const audio = new Audio(audioObjectUrl)
            audio.onended = () => setPlayingRecord(null)
            audio.onerror = () => {
              setPlayingRecord(null)
              console.error("[v0] 음성 재생 실패")
            }
            audio.play()
            return
          }
        } catch (error) {
          console.error("[v0] 음성 파일 로드 실패:", error)
        }
      }

      // 음성 파일이 없거나 실패 시 TTS 사용
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(content)
        utterance.lang = "ko-KR"
        utterance.rate = 0.9
        utterance.onend = () => setPlayingRecord(null)
        utterance.onerror = () => setPlayingRecord(null)
        window.speechSynthesis.speak(utterance)
      }
    }
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">나의 타임라인</h1>
        <div className="flex bg-gray-100 rounded-full p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("timeline")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              viewMode === "timeline" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Clock className="w-4 h-4 mr-1" />
            시간순
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("map")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              viewMode === "map" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Map className="w-4 h-4 mr-1" />
            지도
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6 text-center bg-white rounded-2xl shadow-sm border-0">
          <p className="text-4xl font-bold text-pink-400 mb-2">{stats.createdCount}</p>
          <p className="text-sm text-gray-600 font-medium">내가 남긴 기록</p>
        </Card>
        <Card className="p-6 text-center bg-white rounded-2xl shadow-sm border-0">
          <p className="text-4xl font-bold text-gray-300 mb-2">{stats.listenedCount}</p>
          <p className="text-sm text-gray-600 font-medium">들은 기록</p>
        </Card>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500">타임라인을 불러오는 중...</p>
        </div>
      )}

      {/* Content */}
      {viewMode === "timeline" ? (
        <TimelineView records={records} onPlayAudio={handlePlayAudio} playingRecord={playingRecord} />
      ) : (
        <MapView records={records} />
      )}
    </div>
  )
}

function TimelineView({
  records,
  onPlayAudio,
  playingRecord,
}: {
  records: TimelineRecord[]
  onPlayAudio: (id: number, content: string, audioUrl?: string) => void
  playingRecord: number | null
}) {
  return (
    <Tabs defaultValue="all" className="w-full">
      <div className="bg-gray-100 rounded-full p-1 mb-6">
        <TabsList className="grid w-full grid-cols-3 bg-transparent gap-1">
          <TabsTrigger
            value="all"
            className="rounded-full data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 font-medium"
          >
            전체
          </TabsTrigger>
          <TabsTrigger
            value="created"
            className="rounded-full data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 font-medium"
          >
            내 기록
          </TabsTrigger>
          <TabsTrigger
            value="listened"
            className="rounded-full data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 font-medium"
          >
            들은 기록
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="all" className="space-y-4 mt-0">
        <div className="space-y-4">
          {records.map((record) => (
            <Card key={record.id} className="p-4 bg-white rounded-2xl shadow-sm border-0">
              <div className="flex items-start space-x-3">
                <div
                  className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${record.type === "created" ? "bg-pink-400" : "bg-gray-300"}`}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${record.type === "created" ? "text-pink-600 bg-pink-100" : "text-gray-600 bg-gray-100"} px-3 py-1 rounded-full`}
                    >
                      {record.type === "created" ? "내 기록" : "들은 기록"}
                    </span>
                    <div className="flex items-center space-x-2">
                      {record.audioUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPlayAudio(record.id, record.content, record.audioUrl)}
                          className="h-8 w-8 p-0 hover:bg-pink-50 rounded-full"
                        >
                          {playingRecord === record.id ? (
                            <VolumeX className="w-4 h-4 text-pink-400" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-pink-400" />
                          )}
                        </Button>
                      )}
                      <span className="text-xs text-gray-400 font-medium">
                        {record.date} {record.time}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{record.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{record.content}</p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{record.location}</span>
                    </div>
                    {record.type === "created" ? (
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1 text-sm text-gray-500">
                          <Heart className="w-4 h-4" />
                          <span className="font-medium">{record.likes}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-sm text-gray-500">
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-medium">{record.comments}</span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Play className="w-4 h-4" />
                        <span className="font-medium">{record.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="created" className="space-y-4 mt-0">
        <div className="space-y-4">
          {records
            .filter((r) => r.type === "created")
            .map((record) => (
              <Card key={record.id} className="p-4 bg-white rounded-2xl shadow-sm border-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
                      내 기록
                    </span>
                    <div className="flex items-center space-x-2">
                      {record.audioUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPlayAudio(record.id, record.content, record.audioUrl)}
                          className="h-8 w-8 p-0 hover:bg-pink-50 rounded-full"
                        >
                          {playingRecord === record.id ? (
                            <VolumeX className="w-4 h-4 text-pink-400" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-pink-400" />
                          )}
                        </Button>
                      )}
                      <span className="text-xs text-gray-400 font-medium">
                        {record.date} {record.time}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{record.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{record.content}</p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{record.location}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1 text-sm text-gray-500">
                        <Heart className="w-4 h-4" />
                        <span className="font-medium">{record.likes}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-sm text-gray-500">
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-medium">{record.comments}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </TabsContent>

      <TabsContent value="listened" className="space-y-4 mt-0">
        <div className="space-y-4">
          {records
            .filter((r) => r.type === "listened")
            .map((record) => (
              <Card key={record.id} className="p-4 bg-white rounded-2xl shadow-sm border-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      들은 기록
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {record.date} {record.time}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{record.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{record.content}</p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{record.location}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Play className="w-4 h-4" />
                      <span className="font-medium">{record.duration}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}

function MapView({ records }: { records: TimelineRecord[] }) {
  const { location, isKakaoMapAvailable } = useLocation()

  return (
    <div className="space-y-4">
      <Card className="h-64 p-6 bg-white rounded-2xl shadow-sm border-0">
        <div className="h-full flex items-center justify-center text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Map className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="font-bold text-gray-900">지도 기반 타임라인</p>
              <p className="text-sm text-gray-500 leading-relaxed">내가 기록하고 들은 장소들을 지도에서 확인하세요</p>
              {!isKakaoMapAvailable && (
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <p className="text-xs text-amber-600">지도 API 연결 안됨 - 기본 위치 서비스 사용 중</p>
                </div>
              )}
              {location && (
                <p className="text-xs text-gray-400">
                  현재 위치: 위도 {location.lat.toFixed(6)}, 경도 {location.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="font-bold text-gray-900 px-1">최근 활동 장소</h3>
        {records.slice(0, 3).map((record) => (
          <Card key={record.id} className="p-4 bg-white rounded-2xl shadow-sm border-0">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${record.type === "created" ? "bg-pink-400" : "bg-gray-300"}`} />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{record.location}</p>
                <p className="text-sm text-gray-500">{record.title}</p>
              </div>
              <span className="text-xs text-gray-400 font-medium">{record.date}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PersonalTimeline
