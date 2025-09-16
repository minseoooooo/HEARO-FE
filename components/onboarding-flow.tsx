"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Eye, Headphones, Type, Subtitles, Vibrate, Lightbulb, ArrowRight, Check } from "lucide-react"

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState({
    mode: "visual", // 'visual' or 'audio'
    fontSize: 16,
    subtitles: true,
    vibration: false,
    lightIndicator: true,
    highContrast: false,
  })

  const steps = [
    {
      title: "접근성 모드 선택",
      subtitle: "어떤 방식으로 앱을 사용하시겠어요?",
      component: <ModeSelection preferences={preferences} setPreferences={setPreferences} />,
    },
    {
      title: "글자 크기 설정",
      subtitle: "읽기 편한 글자 크기를 선택해주세요",
      component: <FontSizeSettings preferences={preferences} setPreferences={setPreferences} />,
    },
    {
      title: "접근성 옵션",
      subtitle: "추가 접근성 기능을 설정해주세요",
      component: <AccessibilityOptions preferences={preferences} setPreferences={setPreferences} />,
    },
    {
      title: "설정 완료",
      subtitle: "맞춤 설정이 완료되었습니다",
      component: <CompletionStep preferences={preferences} />,
    },
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        {/* Progress indicator */}
        <div className="flex space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full ${index <= currentStep ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{steps[currentStep].title}</h1>
          <p className="text-muted-foreground">{steps[currentStep].subtitle}</p>
        </div>

        <div className="min-h-[300px]">{steps[currentStep].component}</div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 0} className="w-24 bg-transparent">
            이전
          </Button>
          <Button onClick={nextStep} className="w-24">
            {currentStep === steps.length - 1 ? "완료" : "다음"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  )
}

function ModeSelection({ preferences, setPreferences }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card
          className={`p-6 cursor-pointer transition-all ${
            preferences.mode === "visual"
              ? "ring-2 ring-primary bg-primary/10 border-primary/20"
              : "hover:bg-muted/50 border-border"
          }`}
          onClick={() => setPreferences({ ...preferences, mode: "visual" })}
        >
          <div className="text-center space-y-3">
            <Eye className="w-12 h-12 mx-auto text-primary" />
            <h3 className="font-semibold text-foreground">시각 모드</h3>
            <p className={`text-sm ${preferences.mode === "visual" ? "text-foreground/80" : "text-muted-foreground"}`}>
              화면을 보며 사용
            </p>
          </div>
        </Card>

        <Card
          className={`p-6 cursor-pointer transition-all ${
            preferences.mode === "audio"
              ? "ring-2 ring-primary bg-primary/10 border-primary/20"
              : "hover:bg-muted/50 border-border"
          }`}
          onClick={() => setPreferences({ ...preferences, mode: "audio" })}
        >
          <div className="text-center space-y-3">
            <Headphones className="w-12 h-12 mx-auto text-primary" />
            <h3 className="font-semibold text-foreground">청각 모드</h3>
            <p className={`text-sm ${preferences.mode === "audio" ? "text-foreground/80" : "text-muted-foreground"}`}>
              소리로 사용
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

function FontSizeSettings({ preferences, setPreferences }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Type className="w-5 h-5 text-primary" />
          <span className="font-medium text-foreground">글자 크기: {preferences.fontSize}px</span>
        </div>

        <Slider
          value={[preferences.fontSize]}
          onValueChange={(value) => setPreferences({ ...preferences, fontSize: value[0] })}
          min={12}
          max={24}
          step={2}
          className="w-full"
        />
      </div>

      <Card className="p-4 border-border">
        <h3 className="font-semibold mb-2 text-foreground" style={{ fontSize: `${preferences.fontSize}px` }}>
          미리보기
        </h3>
        <p style={{ fontSize: `${preferences.fontSize}px` }} className="text-foreground/80">
          이 크기로 앱의 텍스트가 표시됩니다. 읽기 편한 크기를 선택해주세요.
        </p>
      </Card>
    </div>
  )
}

function AccessibilityOptions({ preferences, setPreferences }: any) {
  const options = [
    {
      key: "subtitles",
      icon: Subtitles,
      title: "자막 표시",
      description: "오디오 콘텐츠에 자막을 표시합니다",
    },
    {
      key: "vibration",
      icon: Vibrate,
      title: "진동 알림",
      description: "중요한 알림을 진동으로 전달합니다",
    },
    {
      key: "lightIndicator",
      icon: Lightbulb,
      title: "시각적 알림",
      description: "소리 대신 화면 깜빡임으로 알림합니다",
    },
    {
      key: "highContrast",
      icon: Eye,
      title: "고대비 모드",
      description: "텍스트와 배경의 대비를 높입니다",
    },
  ]

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <div key={option.key} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
          <div className="flex items-center space-x-3">
            <option.icon className="w-5 h-5 text-primary" />
            <div>
              <h4 className="font-medium text-card-foreground">{option.title}</h4>
              <p className="text-sm text-card-foreground/70">{option.description}</p>
            </div>
          </div>
          <Switch
            checked={preferences[option.key]}
            onCheckedChange={(checked) => setPreferences({ ...preferences, [option.key]: checked })}
          />
        </div>
      ))}
    </div>
  )
}

function CompletionStep({ preferences }: any) {
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-primary" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">설정이 완료되었습니다!</h3>
        <p className="text-foreground/80">선택하신 설정이 앱 전체에 적용됩니다.</p>
      </div>

      <Card className="p-4 text-left border-border bg-card">
        <h4 className="font-medium mb-3 text-card-foreground">설정 요약</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-card-foreground/80">모드:</span>
            <span className="text-card-foreground">{preferences.mode === "visual" ? "시각 모드" : "청각 모드"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-card-foreground/80">글자 크기:</span>
            <span className="text-card-foreground">{preferences.fontSize}px</span>
          </div>
          <div className="flex justify-between">
            <span className="text-card-foreground/80">자막:</span>
            <span className="text-card-foreground">{preferences.subtitles ? "켜짐" : "꺼짐"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-card-foreground/80">진동 알림:</span>
            <span className="text-card-foreground">{preferences.vibration ? "켜짐" : "꺼짐"}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
