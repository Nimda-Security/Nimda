# NIMDA

> 공주대학교 정보보안 동아리 **NIMDA**의 통합 웹 플랫폼

동아리 커뮤니티 · 운영 · 자체 대회(님다콘)를 하나의 서비스로 연결합니다.

| | |
|---|---|
| **Service** | [nimda.kr](https://nimda.kr) |
| **Landing** | [nimda.space](https://nimda.space) |
| **Period** | 2025.09 — |
| **Stack** | React · Spring Boot · MySQL · Redis · Nginx · Docker |

---

## Overview

| | |
|---|---|
| **Community** | 게시판 · 댓글 · 좋아요 · 알림 · 첨부파일 |
| **Members** | 가입 승인 · JWT 인증 · 역할 기반 권한 · 마이페이지 |
| **Ops** | 관리자 대시보드 · 카테고리 · 태그 · 유저 운영 |
| **Activity** | 출석 · 마일리지 · 배지 · 프로필 장식 |
| **Contest** | 님다콘 — 문제 · 제출 · 스코어보드 |
| **Brand** | 동아리 랜딩 — 활동 · 수상 · 지원 |

---

## Architecture

```
NimdaConFrontEnd     React · Vite · TypeScript
NimdaConBackEnd      Spring Boot 3 · JPA · Flyway
NimdaLandingPage     Next.js
nginx + Docker       Blue-Green 무중단 배포
```

---

## Team

### Backend · Infra

<table>
<tr>
<td width="50%" valign="top">

**최도일**  
`Backend Lead · Infra`

- Spring Boot API · 인증·게시판·태그
- Nginx · Docker Compose
- Flyway 마이그레이션 · 보안 설정
- Blue-Green 배포 파이프라인

</td>
<td width="50%" valign="top">

**이도현**  
`Backend · Contest · CI/CD`

- 대회 도메인 (문제 · 제출 · 채점 연계)
- 카테고리 · 상점 API
- S3 문제 파일 스토어
- CI/CD · 배포 안정화

</td>
</tr>
<tr>
<td width="50%" valign="top">

**이명건**  
`Backend · Domain`

- 마일리지 일괄 지급 · 포인트 도메인
- 댓글 · 좋아요 · 출석 · 알림
- `ROLE_DEV` 등 권한 정책
- Group 도메인 · Cite 구조 분리

</td>
<td width="50%" valign="top">

**주윤호**  
`Backend · Storage`

- AWS S3 연동 · 첨부파일 파이프라인
- CI S3 환경변수 · 시크릿 정리
- JWT / Common 모듈 정리
- 게시판·관리자 FE 연동

</td>
</tr>
</table>

### Frontend · Design

<table>
<tr>
<td width="50%" valign="top">

**서윤**  
`Frontend Lead · Product`

- 게시판 · 댓글 · 에디터 UX
- 마이페이지 · 프로필 · 배지 시스템
- 마일리지 상점 · 구매 플로우
- 레이아웃 · 알림 · 랜딩 기여

</td>
<td width="50%" valign="top">

**정푸른**  
`Frontend · Design`

- BoardList · 탭 · 고정글 UI 폴리시
- 동아리 랜딩 페이지 디자인·구현
- 마이페이지 마일리지 UI
- 비밀번호 변경 MCP 연동

</td>
</tr>
</table>

---

## Highlights

- **권한 분리** — `USER` / `ADMIN` / `DEV` / `CARTEL`
- **마일리지** — 출석 · 활동 포인트 · 배지·장식 상점
- **무중단 배포** — Blue-Green + Nginx graceful reload
- **대회 플랫폼** — 문제 업로드 · 제출 · 스코어보드

---

## Links

[nimda.kr](https://nimda.kr) · [nimda.space](https://nimda.space) · [DEPLOYMENT.md](./DEPLOYMENT.md)
