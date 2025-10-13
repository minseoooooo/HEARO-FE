"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch" // Switch 컴포넌트 임포트 추가
import { X, Mic, Type, Clock, Eye, Users, Lock, Info, Music, MoreHorizontal, Square, Play, Pause } from "lucide-react"
import { useLocation } from "./location-context"
import { fetchApi } from "@/lib/api"
import { cn } from "@/lib/utils"

interface CreateContentModalProps {
  onClose: () => void
}

export function CreateContentModal({ onClose }: CreateContentModalProps) {

  const [inputMode, setInputMode] = useState("text")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("소설") // NOTE: API상 'SOCIAL'로 매핑됩니다.
  const [privacy, setPrivacy] = useState("공개")
  const [duration, setDuration] = useState("1시간")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { location } = useLocation()

  const durations = ["1시간", "6시간", "12시간", "24시간", "48시간", "72시간"]
  const privacyOptions = [
    { value: "공개", icon: Eye, label: "모든 사용자", disabled: false },
    { value: "친구", icon: Users, label: "친구들만", disabled: true },
    { value: "비공개", icon: Lock, label: "나만 보기", disabled: true },
  ]
  const categories = [
    { value: "정보", icon: Info, color: "blue" },
    { value: "소설", icon: Music, color: "pink" }, // '소설'은 'SOCIAL'로 매핑됩니다.
    { value: "기타", icon: MoreHorizontal, color: "gray" },
  ]

  const startRecording = async () => {
    try {
      let mimeType = "audio/webm;codecs=opus"
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/mp4"
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        setAudioBlob(audioBlob)
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(1000)
      setIsRecording(true)
      setRecordingTime(0)

      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000)
      console.log("[v0] 음성 녹음 시작")
    } catch (error: any) {
      console.error("[v0] 마이크 접근 실패:", error)
      alert("마이크 접근에 실패했습니다. 브라우저 설정을 확인해주세요.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      console.log("[v0] 음성 녹음 중지")
    }
  }

  const playAudio = () => audioRef.current?.play()
  const pauseAudio = () => audioRef.current?.pause()
  const handleAudioEnded = () => setIsPlaying(false)
  const handleAudioError = () => {
    setIsPlaying(false)
    console.error("Audio playback error")
  }
  
  const handleSubmit = async () => {
    if ((inputMode === 'text' && !content) || (inputMode === 'voice' && !audioBlob) || !location) {
      alert("내용을 입력하거나 음성을 녹음해주세요.")
      return
    }
    setIsSubmitting(true)

    try {
      let response;
      
      if (inputMode === 'text') {
        const visibilityMap: { [key: string]: string } = { "공개": "PUBLIC", "친구": "FRIENDS_ONLY", "비공개": "PRIVATE" };
        const categoryMap: { [key: string]: string } = { "정보": "INFORMATION", "소설": "SOCIAL", "기타": "OTHER" };
        const durationMap: { [key: string]: number } = { "1시간": 3600, "6시간": 21600, "12시간": 43200, "24시간": 86400, "48시간": 172800, "72시간": 259200 };

        const postData = {
          content: content,
          latitude: location.lat,
          longitude: location.lng,
          visibility: visibilityMap[privacy],
          anonymity: isAnonymous,
          postType: categoryMap[category],
          duration: durationMap[duration],
        };
        
        console.log("[v0] 텍스트 게시물(JSON) 전송 시도:", postData);
        response = await fetchApi("https://api.herehear.p-e.kr/posts/text", {
          method: "POST",
          body: JSON.stringify(postData),
        });

      } else {
        const endpoint = `https://api.herehear.p-e.kr/posts/audio?latitude=${location.lat}&longitude=${location.lng}`;
        const formData = new FormData();
        if (audioBlob) formData.append("file", audioBlob, `voice_${Date.now()}.webm`);
        
        console.log(`[v0] 음성 게시물(FormData) 전송 시도: ${endpoint}`);
        response = await fetchApi(endpoint, { method: "POST", body: formData });
      }

      if (response.ok) {
        alert("게시물이 성공적으로 등록되었습니다!");
        onClose();
      } else {
        const errorResult = await response.json().catch(() => ({}));
        console.error("[v0] 게시물 전송 실패:", response.status, errorResult);
        alert(`게시물 등록에 실패했습니다. (에러: ${errorResult.message || response.statusText})`);
      }
    } catch (error) {
      console.error("[v0] 게시물 전송 오류:", error);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    const currentAudioRef = audioRef.current;
    if (currentAudioRef) {
        currentAudioRef.addEventListener('play', () => setIsPlaying(true));
        currentAudioRef.addEventListener('pause', () => setIsPlaying(false));
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && isRecording) mediaRecorderRef.current.stop()
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      if (currentAudioRef) {
        currentAudioRef.removeEventListener('play', () => setIsPlaying(true));
        currentAudioRef.removeEventListener('pause', () => setIsPlaying(false));
      }
    }
  }, [isRecording, audioUrl])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed inset-0 bg-primary/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">새 게시물</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <h3 className="font-medium">게시물 형태</h3>
            <div className="flex space-x-2">
              <Button variant={inputMode === "text" ? "default" : "outline"} size="sm" onClick={() => setInputMode("text")} className="flex-1">
                <Type className="w-4 h-4 mr-2" /> 텍스트
              </Button>
              <Button variant={inputMode === "voice" ? "default" : "outline"} size="sm" onClick={() => setInputMode("voice")} className="flex-1">
                <Mic className="w-4 h-4 mr-2" /> 음성
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">내용</h3>
            {inputMode === "text" ? (
              <Textarea
                placeholder="무슨 일이 일어나고 있나요?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            ) : (
              <Card className="p-8 text-center border-2 border-dashed">
                  <div className="space-y-4">
                    <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${isRecording ? "bg-red-100 animate-pulse" : "bg-muted"}`}>
                      {isRecording ? <Square className="w-8 h-8 text-red-500" /> : <Mic className="w-8 h-8 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="font-medium">{isRecording ? `녹음 중... ${formatTime(recordingTime)}` : audioBlob ? "녹음 완료" : "음성 녹음하기"}</p>
                      <p className="text-sm text-muted-foreground mt-1">{isRecording ? "말씀해주세요" : audioBlob ? "재생하거나 다시 녹음할 수 있습니다" : "버튼을 눌러 녹음을 시작하세요"}</p>
                    </div>
                    
                    {audioBlob && audioUrl && (
                      <div className="space-y-2">
                        <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnded} onError={handleAudioError} className="hidden" />
                        <div className="flex justify-center space-x-2">
                          <Button onClick={isPlaying ? pauseAudio : playAudio} size="sm" variant="outline">
                            {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                            {isPlaying ? "일시정지" : "재생"}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-x-2">
                      <Button onClick={isRecording ? stopRecording : startRecording} className={isRecording ? "bg-red-500 hover:bg-red-600" : ""}>
                        {isRecording ? "녹음 중지" : audioBlob ? "다시 녹음" : "녹음 시작"}
                      </Button>
                      {audioBlob && (<Button variant="outline" onClick={() => { setAudioBlob(null); if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null); } setIsPlaying(false); }}>삭제</Button>)}
                    </div>
                  </div>
              </Card>
            )}
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">카테고리</h3>
            <div className="flex space-x-2">
              {categories.map((cat) => (
                <Button key={cat.value} variant={category === cat.value ? "default" : "outline"} size="sm" onClick={() => setCategory(cat.value)} className="flex-1">
                  <cat.icon className={`w-4 h-4 mr-2 text-${cat.color}`} />
                  {cat.value}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">유지 시간</h3>
            <div className="grid grid-cols-3 gap-2">
              {durations.map((dur) => (<Button key={dur} variant={duration === dur ? "default" : "outline"} size="sm" onClick={() => setDuration(dur)} className="text-xs"><Clock className="w-3 h-3 mr-1" />{dur}</Button>))}
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">공개 범위</h3>
            <div className="space-y-2">
              {privacyOptions.map((option) => (
                <Card
                  key={option.value}
                  onClick={() => !option.disabled && setPrivacy(option.value)}
                  className={cn(
                    "p-3 transition-all",
                    privacy === option.value && "ring-2 ring-primary bg-primary/5",
                    option.disabled
                      ? "cursor-not-allowed bg-gray-100 opacity-50"
                      : "cursor-pointer hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <option.icon className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{option.value}</p>
                      <p className="text-sm text-muted-foreground">{option.label}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="anonymous-switch" className="flex flex-col cursor-pointer">
                <span className="font-medium">익명 게시</span>
                <span className="text-sm text-muted-foreground">작성자를 익명으로 표시합니다.</span>
            </label>
            <Switch
                id="anonymous-switch"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
            />
          </div>
          
          <Button className="w-full" disabled={(!content && !audioBlob) || isSubmitting || !location} onClick={handleSubmit}>
            {isSubmitting ? "게시 중..." : "게시하기"}
          </Button>

          {!location && <p className="text-sm text-red-500 text-center">위치 정보를 가져오는 중...</p>}
        </div>
      </Card>
    </div>
  )
}