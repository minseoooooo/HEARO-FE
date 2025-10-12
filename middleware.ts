import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 쿠키에서 accessToken 가져오기
  const token = request.cookies.get('accessToken')?.value
  const { pathname } = request.nextUrl

  // 보호된 경로(홈페이지 등)와 공개 경로(로그인 페이지) 정의
  const protectedRoutes = ['/']
  const publicRoutes = ['/auth']

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // 토큰이 없는데 보호된 경로에 접근하려는 경우 -> 로그인 페이지로 리디렉션
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // 토큰이 있는데 공개 경로(로그인 페이지)에 접근하려는 경우 -> 홈페이지로 리디렉션
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// 미들웨어가 실행될 경로를 지정합니다.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public 폴더 안의 이미지 파일들
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}