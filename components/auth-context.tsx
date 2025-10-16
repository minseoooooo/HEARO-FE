"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    /** ✅ 로그아웃 처리 */
    const logout = () => {
        if (typeof window === "undefined") return;
        localStorage.removeItem("accessToken");
        document.cookie = "accessToken=; path=/; max-age=-1;";
        setToken(null);
        // ✅ 실제 로그인 페이지는 /auth 이므로 /auth로 이동
        window.location.replace("/auth");
    };

    /** ✅ 초기 토큰 확인 및 이벤트 등록 */
    useEffect(() => {
        if (typeof window === "undefined") return;

        const storedToken = localStorage.getItem("accessToken");
        setToken(storedToken);
        setIsLoading(false);

        // 401 인증 만료 시 로그아웃 이벤트
        const handleAuthError = () => logout();
        window.addEventListener("auth-error", handleAuthError);
        return () => window.removeEventListener("auth-error", handleAuthError);
    }, []);

    /** ✅ 로그인 시 토큰 저장 및 쿠키 설정 */
    const login = (newToken: string) => {
        if (typeof window === "undefined") return;

        localStorage.setItem("accessToken", newToken);
        document.cookie = `accessToken=${newToken}; path=/; max-age=86400; SameSite=Lax; Secure;`;
        setToken(newToken);
        // ✅ 로그인 완료 후 메인화면으로 이동
        window.location.replace("/");
    };

    /** ✅ 로그인 상태 기반 리디렉션 처리 (루프 방지 포함) */
    useEffect(() => {
        if (isLoading) return;

        // ✅ 로그인 안 된 경우 — 이미 /auth라면 리디렉션 안 함
        if (!token) {
            if (pathname !== "/auth") {
                window.location.replace("/auth");
            }
            return;
        }

        // ✅ 이미 로그인한 상태인데 로그인 페이지 접근 시
        if (token && pathname === "/auth") {
            window.location.replace("/");
        }
    }, [token, pathname, isLoading]);

    const value = { isAuthenticated: !!token, token, login, logout, isLoading };

    if (isLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center text-gray-500">
                Loading...
            </div>
        );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}

