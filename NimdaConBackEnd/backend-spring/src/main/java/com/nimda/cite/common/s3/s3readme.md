# NIMDA S3 정리

S3는 **원본 저장소** 역할만 한다.
리사이징 / 변환 / 썸네일 생성 파이프라인은 **없음**.

---

## 1. 핵심 파일

### 인프라 (`common/s3/`)
| 파일 | 역할 |
|------|------|
| `S3Service.java` | Presigned PUT / GET 발급 |
| `S3Properties.java` | 버킷·리전·키·경로 설정 |
| `S3Config.java` | S3Client / S3Presigner 빈 생성 |
| `AwsS3ConfiguredCondition.java` | S3 설정 있을 때만 Bean 등록 |

### 스토어 (`domain/attachment/store/`)
| 파일 | 역할 |
|------|------|
| `FileStore.java` | 저장소 인터페이스 |
| `S3FileStore.java` | S3 구현체 (삭제·문제파일 직접 업/다운·Presigned 래핑) |
| `LocalFileStore.java` | 로컬 디스크 구현체 (S3 미설정 시) |

### 도메인 / 유틸
| 파일 | 역할 |
|------|------|
| `AttachmentController.java` | 첨부 Presigned API 입구 |
| `AttachmentService.java` | 첨부 DB 등록·연결·삭제 |
| `ImageSanitizer.java` | multipart `/upload` 경로 이미지 재인코딩(보안) |

### 프론트
| 파일 | 역할 |
|------|------|
| `src/api/attachments.ts` | Presigned → PUT → register 클라이언트 흐름 |
| `src/api/auth.ts` | 프로필 이미지 key 저장 |
| `src/api/profileDecorations.ts` | 배지/장식 이미지 Presigned 업로드 |

S3 경로 prefix (`S3Properties`)
- `profiles/` · `boards/` · `boards/files/` · `problems/`

---

## 2. 메인 업로드 흐름 (게시글 첨부)

```
1) POST /api/cite/attachments/presigned
   → 업로드용 Presigned URL + key 발급

2) Client → S3 PUT (직접 업로드)
   ※ 프론트 Canvas 재인코딩(EXIF 제거)은 S3 전에 브라우저에서 수행

3) POST /api/cite/attachments/register
   → 앱 DB에 메타 등록 (key, 파일명, 크기 등)
   ※ S3가 아니라 MySQL(Attachment 테이블)

4) 게시글 저장 시 attachmentIds로 글과 연결
```

에디터의 이미지 "리사이즈"는 **CSS 표시 크기**만 조절. S3 파일은 안 바뀜.

---

## 3. Attachment API

Controller: `AttachmentController`  
Base: `/api/cite/attachments`

| Method | Endpoint | 용도 |
|--------|----------|------|
| POST | `/presigned` | 업로드용 Presigned URL 발급 |
| POST | `/register` | S3 업로드 후 **앱 DB** 메타 등록 |
| GET | `/{id}/download` | 파일 조회 (S3면 Presigned로 리다이렉트) |
| GET | `/{id}/download-url` | Presigned GET URL만 반환 |
| POST | `/upload` | (구버전) multipart 서버 경유 업로드 |
| GET | `/{id}` | 첨부 메타 조회 |
| GET | `/my` | 내 첨부 목록 |
| DELETE | `/` | 첨부 삭제 (S3 객체 + DB) |

> `/upload` : 현재 메인 경로는 Presigned.  
> FE `attachments.ts`에 레거시 호출이 남아 있을 수 있어, 사용처 확인 후 제거 검토.

---

## 4. 용도별 S3 사용처

### A. 게시글 첨부
- 업로드: `presigned` → PUT → `register`
- 조회: `download` / `download-url`
- FE: BoardWrite / BoardEdit / BoardDetail / PhotoGallery / Shop / Banner

### B. 프로필 이미지
- FE: Presigned 업로드 → key를 `PUT /api/auth/profile-image`로 저장
- 조회 시 key → Presigned GET URL로 변환
  - `AuthController`, `UsersController`
  - `BoardController`, `CommentController`
  - `NotificationController`, `AttendanceController`

### C. 프로필 장식 / 배지
- FE: `profileDecorations.ts` Presigned 업로드
- BE: `ProfileDecorationController` — key → Presigned GET

### D. 대회 문제 파일
- Presigned가 아니라 **서버가 S3에 직접 PUT/GET/DELETE**
- `ProblemService` → `S3FileStore`
  - `uploadProblemFile`
  - `getProblemHtml`
  - `deleteProblemDirectory`

---

## 5. 계층 구조

```
Controller / Service
        ↓
   FileStore (인터페이스)
        ↓
 S3FileStore  ←→  S3Service (Presigned)
        ↓              ↓
     S3Client      S3Presigner
```

- `common/s3` = AWS SDK 래퍼 (인프라)
- `attachment/store` = 파일 저장 정책 (도메인 구현)

---

## 6. 없는 것

- S3/Lambda 이미지 리사이징
- CloudFront Image / imgix 등 CDN 변환
- 서버가 Presigned 업로드 파일을 다시 받아서 가공하는 후처리
