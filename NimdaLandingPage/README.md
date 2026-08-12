# NIMDA Landing Page

Next.js 16과 React 19로 작성된 정적 동아리 랜딩 페이지입니다. `output: 'export'`를 사용하므로 배포 대상은 Node 서버가 아니라 `out/`의 정적 파일입니다.

## Requirements

- Node.js 22 LTS
- npm 10 이상

## Commands

이 디렉터리에서 실행합니다.

```bash
npm ci
npm run dev
npm run lint
npm run build
npm audit --omit=dev
```

성공하면 ESLint 오류가 없고 `/`와 `/_not-found`가 정적으로 생성되며 audit 취약점이 0건입니다.

## Image and Animation Policy

- 화면 이미지는 `next/image`와 명시적 크기 또는 `fill`/`sizes`를 사용합니다.
- 첫 화면 로고만 priority이며 타임라인 이미지는 지연 로딩합니다.
- 정적 export 때문에 `images.unoptimized`를 사용합니다. 원격 Image Optimizer 서버를 운영하지 않습니다.
- 별 배경은 seed 기반 결정적 데이터로 생성해 hydration mismatch와 mount 직후 추가 state render를 피합니다.

## Deployment

```bash
npm run build
# out/ 디렉터리를 정적 호스팅에 업로드
```

`.next/`와 `out/`은 생성물이며 Git에 커밋하지 않습니다. 2026-07-10 Windows 11에서 Next.js 16.2.10 lint/build와 production dependency audit를 통과했습니다.
