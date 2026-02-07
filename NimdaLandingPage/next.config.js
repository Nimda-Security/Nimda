/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",       // next export와 동일한 정적 빌드
  images: { unoptimized: true }, // 정적 배포에서 next/image 최적화 비활성
};

module.exports = nextConfig;
