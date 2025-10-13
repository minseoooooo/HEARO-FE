/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // ✅ 정적 사이트로 내보내기
    images: {
        unoptimized: true, // ✅ export 모드에선 필요 (Next Image 최적화 끔)
    },
};

module.exports = nextConfig;
