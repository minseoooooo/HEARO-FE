"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  login: (token: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken")
    if (storedToken) {
      setToken(storedToken)
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string) => {
    localStorage.setItem("accessToken", newToken)
    // 미들웨어가 인식할 수 있도록 쿠키를 설정합니다. (유효기간: 1일)
    document.cookie = `accessToken=${newToken}; path=/; max-age=86400; SameSite=Lax;`
    setToken(newToken)
    router.push("/")
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    // 쿠키를 만료시켜 삭제합니다.
    document.cookie = "accessToken=; path=/; max-age=-1;"
    setToken(null)
    router.push("/auth")
  }

  const value = {
    isAuthenticated: !!token,
    token,
    login,
    logout,
    isLoading,
  }

  // 인증 상태를 확인하는 동안 아무것도 렌더링하지 않아 화면 깜빡임을 방지합니다.
  if (isLoading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}