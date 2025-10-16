/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // ✅ 정적 사이트로 내보내기
    eslint: {ignoreDuringBuilds: true},
    typescript: {ignoreBuildErrors: true},
    images: {unoptimized: true},
}

module.exports = nextConfig