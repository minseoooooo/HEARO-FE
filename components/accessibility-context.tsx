"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

// 폰트 크기 단계 정의
const fontSizes = [
  { name: "매우 작게", size: "12px" },
  { name: "작게", size: "14px" },
  { name: "보통", size: "16px" },
  { name: "크게", size: "18px" },
  { name: "매우 크게", size: "20px" },
]

interface AccessibilityContextType {
  fontSize: number
  setFontSize: (size: number) => void
  fontSizes: typeof fontSizes
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState(2) // 기본값 '보통' (인덱스 2)

  useEffect(() => {
    // html 태그의 폰트 크기를 직접 변경합니다.
    // 이렇게 하면 rem 단위를 사용하는 모든 UI 요소의 크기가 함께 조절됩니다.
    document.documentElement.style.fontSize = fontSizes[fontSize].size
  }, [fontSize])

  return (
    <AccessibilityContext.Provider value={{ fontSize, setFontSize, fontSizes }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}