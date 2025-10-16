import type React from "react"
import type {Metadata} from "next"
import {GeistSans} from "geist/font/sans"
import {GeistMono} from "geist/font/mono"
import {Analytics} from "@vercel/analytics/next"
import {ThemeProvider} from "@/components/theme-provider"
import {Suspense} from "react"
import {AccessibilityProvider} from "@/components/accessibility-context"
import {AuthProvider} from "@/components/auth-context" // AuthProvider 임포트
import "/styles/globals.css"

export const metadata: Metadata = {
    title: "HereHear - 위치 기반 음성 메시지 앱",
    description: "위치 기반 음성 메시지 소셜 플랫폼",
    generator: "v0.app",
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ko" suppressHydrationWarning>
        <head>
            <script
                type="text/javascript"
                src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services,clusterer,drawing&autoload=false`}
            />
        </head>
        <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                <AccessibilityProvider>
                    {/* ✅ AuthProvider 내부에서 로그인 여부 판단 및 리디렉션 수행 */}
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </AccessibilityProvider>
            </ThemeProvider>
        </Suspense>
        <Analytics/>
        </body>
        </html>
    )
}