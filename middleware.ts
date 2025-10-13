import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const { pathname } = request.nextUrl

  const isAuthPage = pathname.startsWith('/auth')

  // 토큰이 없는데, 접근하려는 페이지가 로그인 페이지가 아닌 경우
  if (!token && !isAuthPage) {
    // 로그인 페이지로 리디렉션
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // 토큰이 있는데 로그인 페이지에 접근하려는 경우
  if (token && isAuthPage) {
    // 홈페이지로 리디렉션
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