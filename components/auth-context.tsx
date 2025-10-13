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

  const logout = () => {
    localStorage.removeItem("accessToken")
    // 쿠키의 유효기간을 과거로 설정하여 즉시 삭제합니다.
    document.cookie = "accessToken=; path=/; max-age=-1;"
    setToken(null)
    router.push("/auth")
  }
  
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken")
    if (storedToken) {
      setToken(storedToken)
    }
    setIsLoading(false)

    const handleAuthError = () => {
      logout()
    }

    window.addEventListener("auth-error", handleAuthError)
    return () => {
      window.removeEventListener("auth-error", handleAuthError)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = (newToken: string) => {
    localStorage.setItem("accessToken", newToken)
    // 미들웨어가 인식할 수 있도록 쿠키를 설정합니다.
    document.cookie = `accessToken=${newToken}; path=/; max-age=86400; SameSite=Lax;`
    setToken(newToken)
    router.push("/")
  }

  const value = { isAuthenticated: !!token, token, login, logout, isLoading }

  if (isLoading) {
    return null; // 로딩 중에는 아무것도 표시하지 않아 화면 깜빡임 방지
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