# NIMDA Community Frontend

React 19, TypeScript, Vite 7 기반 커뮤니티 UI입니다.

## Requirements

- Node.js 22 LTS
- npm 10 이상

## Commands

이 디렉터리에서 실행합니다.

```bash
npm ci
npm run dev       # 개발 서버
npm run lint      # ESLint, 소스 비변경
npm run build     # production build를 dist/에 생성
npm run preview   # 생성된 dist/ 확인
```

현재 자동 테스트 스크립트는 없습니다. `npm run format`은 소스 파일을 직접 변경하므로 검증 명령으로 사용하지 않습니다.

## Environment

`cp .env.example .env` 후 필요할 때만 값을 재정의합니다.

- `VITE_API_BASE_URL`: 기본 `/api`
- `VITE_SCOREBOARD_ENDPOINT`: 기본 `/scoreboard`

실제 자격 증명은 프론트엔드 환경변수에 넣지 않습니다. `VITE_` 값은 빌드 결과에 공개됩니다.

## Performance, Integrity, and Behavior Gates

- 초기 경로 JS 300 KiB gzip 이하, CSS 100 KiB gzip 이하
- LCP p75 2.5초 이하, INP 200ms 이하, CLS 0.10 이하
- 페이지는 route-level dynamic import를 유지하며 Monaco/editor/admin 코드를 초기 로그인 경로에 포함하지 않습니다.
- 글 수정 상세 로드가 실패하면 생성 모드로 전환하지 않고 입력과 등록을 비활성화합니다.
- 업로드가 하나라도 진행 중이면 등록을 막고, presign 요청에는 실제 파일 크기를 전달합니다. 첨부 목록을 비운 수정 요청은 서버에 명시적으로 동기화합니다.
- 인증 상태를 확인하기 전에는 관리자·사용자 전용 UI를 낙관적으로 표시하지 않습니다. 로그아웃은 서버 응답을 기다린 뒤 로컬 인증 상태를 항상 정리하고 서버 폐기 실패를 사용자에게 알립니다.
- 390px viewport에서 홈, 404, 글쓰기와 실패한 글 수정 화면의 문서 폭이 viewport를 넘지 않아야 합니다.
- 알림 초기 상태 요청은 한 번만 보내며, SSE 구독은 unmount 시 중단해야 합니다.

2026-07-10 production preview에서 홈·404·실패한 글 수정 화면은 모두 `innerWidth=390`, `scrollWidth=390`이었고 실패 화면의 fieldset과 등록 버튼이 비활성화됐습니다. 로그인 초기 JS 전송량은 99,864B였습니다. 글쓰기 editor lazy chunk는 541.72 KiB raw/166.36 KiB gzip으로 Vite의 500 KiB raw 경고 대상이지만 초기 경로에는 로드되지 않으며 route gzip 예산 이내입니다. ESLint, Vite build와 `npm audit --omit=dev`가 통과했습니다. 원시 측정값과 전체 프로토콜은 루트 `README.md`를 참조하십시오.
