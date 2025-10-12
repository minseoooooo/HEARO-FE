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

    // 401 오류 발생 시 로그아웃을 처리하는 이벤트 리스너
    const handleAuthError = () => {
      logout()
    }

    window.addEventListener("auth-error", handleAuthError)

    return () => {
      window.removeEventListener("auth-error", handleAuthError)
    }
  }, [])

  const login = (newToken: string) => {
    localStorage.setItem("accessToken", newToken)
    document.cookie = `accessToken=${newToken}; path=/; max-age=86400; SameSite=Lax;`
    setToken(newToken)
    router.push("/")
  }

  const value = {
    isAuthenticated: !!token,
    token,
    login,
    logout,
    isLoading,
  }

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