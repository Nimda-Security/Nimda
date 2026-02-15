# NimdaPage
Nimda Security Web Page Team Project 

# .env 파일 가이드 

프로젝트 실행을 위해 두 개의 `.env` 파일이 필요합니다.

## 루트 디렉토리 .env

Docker Compose 실행용입니다.

```bash
cp .env.example .env
```

필요한 변수:
- `MYSQL_ROOT_PASSWORD` - MySQL root 비밀번호
- `MYSQL_DATABASE` - 데이터베이스 이름 (기본값: nimda_con)
- `MYSQL_USER` - MySQL 사용자 이름 (기본값: nimda)
- `MYSQL_PASSWORD` - MySQL 사용자 비밀번호

## 프론트엔드 .env

프론트엔드 빌드용입니다. 선택사항이며, 개발 환경에서는 vite.config.ts의 proxy 설정을 사용합니다.

```bash
cd NimdaConFrontEnd
cp .env.example .env
```

사용 가능한 변수:
- `VITE_API_BASE_URL` - API 베이스 URL (기본값: /api)
- `VITE_SCOREBOARD_ENDPOINT` - 스코어보드 엔드포인트 (기본값: /scoreboard)

## 주의사항

- `.env` 파일은 Git에 커밋하지 마세요 (이미 .gitignore에 포함됨)
- 실제 비밀번호는 팀 채팅으로 별도 공유
- `.env.example` 파일은 Git에 커밋되어 있으니 참고하세요
