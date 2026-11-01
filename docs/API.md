# NIMDA API 명세

> 백엔드 컨트롤러 24개에서 추출한 엔드포인트 **138개**. 권한은 `SecurityConfig` URL 규칙과 `@PreAuthorize`, 컨트롤러 내부 검사를 합쳐 판정했습니다.

| 🟢 공개 | 🔵 로그인 | 🔴 ADMIN |
| :-: | :-: | :-: |
| 14 | 88 | 36 |

## 목차

| 모듈 | 패키지 | 엔드포인트 | 대표 경로 |
| --- | --- | :-: | --- |
| [인증 · 회원](#auth) | `user` | 13 | `/api/auth` · `/api/users` · `/api/cite/passwordChange` |
| [관리자 · 회원 관리](#admin-user) | `user` | 10 | `/api/admin/users` |
| [게시판](#board) | `board` | 18 | `/api/cite/board` · `/api/admin/boards` · `/api/download` |
| [카테고리](#category) | `board` | 8 | `/api/cite/category` |
| [댓글](#comment) | `comment` | 9 | `/api/board` · `/api/my-page` · `/api/comments` |
| [좋아요](#like) | `like` | 9 | `/api/like/board` · `/api/like/comment` |
| [첨부파일 · S3](#attachment) | `attachment` | 8 | `/api/cite/attachments` |
| [알림 · SSE](#notification) | `alarm · notification` | 7 | `/api/alarm` · `/api/notifications` |
| [출석](#attendance) | `attendance` | 7 | `/api/cite/attendance` |
| [마일리지 · 상점](#point) | `point` | 8 | `/api/cite/point` · `/api/cite/board` |
| [프로필 장식 · 배지](#decoration) | `profiledecoration` | 8 | `/api/cite/profile-decorations` · `/api/cite/admin` |
| [태그](#tag) | `tag` | 5 | `/api/cite/tag` |
| [대회 · 문제](#problem) | `judgeServer/problem` | 8 | `/api/judge/problem` |
| [제출 · 채점](#submission) | `judgeServer/submission` | 6 | `/api/judge/submission` |
| [그룹](#group) | `judgeServer/group*` | 14 | `/api/groups` |
| [스키마 (DTO · Enum)](#schemas) | | | |

## 공통 규약

| 항목 | 내용 |
| --- | --- |
| Base URL | `https://nimda.kr/api` (Vercel이 Lightsail 인스턴스로 rewrite) · 로컬 `http://localhost:8080/api` |
| 인증 | 로그인 시 발급되는 **`Authorization` HttpOnly 쿠키**(JWT, 24시간). 요청 시 `credentials: "include"` 필요 |
| 권한 | `ROLE_USER` (가입 승인 시) · `ROLE_ADMIN` · `ROLE_DEV` · `ROLE_CARTEL` — 게시판 카테고리별 작성 권한에 DEV · CARTEL 사용 |
| 응답 포맷 | 대부분 `ApiResponse` = `{ "success": bool, "message"?: string, "data"?: T }`. 표의 **응답** 칸은 `data`의 형태 |
| raw 응답 | 응답 칸에 `raw`가 붙은 엔드포인트(Auth · AdminUser · AdminBoard 등)는 래퍼 없이 `{ success, message, ... }` 맵을 직접 반환 |
| 페이지네이션 | Spring `Pageable` — `?page=0&size=20&sort=createdAt,desc`, 응답은 Spring `Page` 또는 `BoardListResponseDTO` |
| 업로드 한도 | multipart 10MB (`spring.servlet.multipart`) · S3 Presigned 업로드는 10분 유효 |
| Rate limit | Nginx `/api` 10 req/s (burst 20), 초과 시 `429` |
| 에러 | `400` 잘못된 요청 · `401` 로그인 필요 · `403` 권한 없음 · `404` 없음 · `500` 서버 오류 — 본문은 `{ success: false, message }` |

> 표의 **요청** 칸 — `name?`는 선택, `name=값`은 기본값, 경로 변수(`{id}`)는 생략했습니다.

<a id="auth"></a>

## 인증 · 회원

<sub>[`AuthController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/user/controller/AuthController.java), [`UsersController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/user/controller/UsersController.java), [`UserRecoveryController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/user/controller/UserRecoveryController.java)</sub>

| Method | Endpoint | 권한 | 설명 | 요청 | 응답 |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/auth/login` | 🟢 공개 | 로그인. 성공 시 `Authorization` HttpOnly 쿠키(24h) 발급 + 로그인 이벤트(자동 출석 · 출석 마일리지) | Body [LoginDTO](#logindto) | [LoginResponseDTO](#loginresponsedto) · raw |
| `POST` | `/api/auth/logout` | 🔵 로그인 | 로그아웃. `Authorization` 쿠키 만료 | — | 메시지 · raw |
| `POST` | `/api/auth/register` | 🟢 공개 | 회원가입. 관리자 승인 전까지 `PENDING` | Body [RegisterDTO](#registerdto) | 메시지 · raw |
| `GET` | `/api/auth/me` | 🔵 로그인 | 내 정보 (마이페이지) | — | [MyPageResponseDTO](#mypageresponsedto) · raw |
| `PUT` | `/api/auth/me` | 🔵 로그인 | 내 프로필 수정 | Body [UpdateProfileDTO](#updateprofiledto) | [MyPageResponseDTO](#mypageresponsedto) · raw |
| `PUT` | `/api/auth/profile-image` | 🔵 로그인 | 프로필 이미지 변경. S3 업로드 후 받은 key를 저장 | `{ "profileImageKey" }` | 메시지 · raw |
| `PUT` | `/api/auth/profile-decoration` | 🔵 로그인 | 프로필 장식 적용 (보유한 장식만) | `{ "profileDecorationKey" }` | 메시지 · raw |
| `POST` | `/api/auth/email-hide` | 🔵 로그인 | 이메일 공개/비공개 토글 | — | 메시지 · raw |
| `GET` | `/api/users/nickname/{nickname}` | 🔵 로그인 | 닉네임으로 공개 프로필 조회 <sup>[1]</sup> | — | `{ bojId, createdAt, email, major, nickname, profileDecoration, profileImage }` · raw |
| `POST` | `/api/cite/passwordChange/info-check` | 🟢 공개 | 비밀번호 찾기 ① 아이디 · 학번 · 이메일 확인 → `password_change_token` 쿠키 발급 | Body [CheckUserValidateRequest](#checkuservalidaterequest) | [CheckUserValidateResponse](#checkuservalidateresponse) |
| `POST` | `/api/cite/passwordChange/send-authMail` | 🟢 공개 | 비밀번호 찾기 ② 인증 코드 메일 발송 (5분 TTL, 하루 3회) | Body [CheckUserValidateRequest](#checkuservalidaterequest), 쿠키 `password_change_token` | 메시지 · raw |
| `POST` | `/api/cite/passwordChange/check-authcode` | 🟢 공개 | 비밀번호 찾기 ③ 인증 코드 확인 | Body [CheckAuthCodeRequest](#checkauthcoderequest), 쿠키 `password_change_token` | 메시지 · raw |
| `POST` | `/api/cite/passwordChange/change-password` | 🟢 공개 | 비밀번호 찾기 ④ 새 비밀번호 저장 | 쿠키 `password_change_token`, Body [ChangePasswordRequest](#changepasswordrequest) | 메시지 · raw |

<sub>[1] `GET /api/users/nickname/{nickname}` — 코드 주석은 '인증 불필요'지만 실제로는 로그인 필요</sub><br>

<a id="admin-user"></a>

## 관리자 · 회원 관리

<sub>[`AdminUserController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/user/controller/AdminUserController.java)</sub>

| Method | Endpoint | 권한 | 설명 | 요청 | 응답 |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/admin/users` | 🔴 ADMIN | 전체 회원 목록 | — | `{ users }` · [AdminUserListResponseDTO](#adminuserlistresponsedto) · raw |
| `GET` | `/api/admin/users/pending` | 🔴 ADMIN | 가입 승인 대기 목록 | — | `{ count, users }` · raw |
| `PUT` | `/api/admin/users/{id}/approve` | 🔴 ADMIN | 가입 승인 (`APPROVED` + `ROLE_USER` 부여) | — | `{ user }` · raw |
| `PUT` | `/api/admin/users/{id}/reject` | 🔴 ADMIN | 가입 거절 (`REJECTED`) | — | `{ user }` · raw |
| `GET` | `/api/admin/users/roles` | 🔴 ADMIN | 서버에 등록된 권한 목록 | — | `{ roles }` · raw |
| `PUT` | `/api/admin/users/{id}/role` | 🔴 ADMIN | 권한 1개 부여 | `{ "role": "ROLE_DEV" }` | `{ roles }` · raw |
| `PUT` | `/api/admin/users/{id}/role/remove` | 🔴 ADMIN | 권한 1개 회수 | `{ "role" }` | `{ roles }` · raw |
| `GET` | `/api/admin/users/{id}` | 🔴 ADMIN | 회원 상세 | — | `{ user }` · [AdminUserDetailResponseDTO](#adminuserdetailresponsedto) · raw |
| `POST` | `/api/admin/users/tag-delete/{tag}` | 🔴 ADMIN | 미구현 — 입력한 `tag`를 그대로 반환 | — | `string` |
| `GET` | `/api/admin/users/suggestions` | 🔴 ADMIN | 마일리지 지급 화면용 회원 목록 (학번 · 이름) | — | `{ users }` · [UserSuggestionResponseDTO](#usersuggestionresponsedto) · raw |

<a id="board"></a>

## 게시판

<sub>[`BoardController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/board/controller/BoardController.java), [`AdminBoardController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/board/controller/AdminBoardController.java), [`FileDownloadController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/board/controller/FileDownloadController.java)</sub>

| Method | Endpoint | 권한 | 설명 | 요청 | 응답 |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/cite/board` | 🔵 로그인 | 카테고리별 게시글 목록 (검색 · 하위 카테고리 포함) | `categoryId?`, `slug?`, `searchKeyword?`, `includeChildren?=false`, `page` `size` `sort` | [BoardListResponseDTO](#boardlistresponsedto) |
| `GET` | `/api/cite/board/pinned` | 🔵 로그인 | 고정 게시글 목록 | `categoryId?`, `slug?`, `page` `size` `sort` | [BoardListResponseDTO](#boardlistresponsedto) |
| `GET` | `/api/cite/board/popular` | 🔵 로그인 | 인기 게시글 목록 | `categoryId?`, `slug?`, `page` `size` `sort` | [BoardListResponseDTO](#boardlistresponsedto) |
| `POST` | `/api/cite/board` | 🔵 로그인 | 게시글 작성. 카테고리별 작성 권한(ADMIN · DEV · CARTEL) 검사, 공지면 전체 알림 | `categoryId`, `title`, `content`, `tagId?`, `attachmentIds?`, `pinned?`, `itemPrice?`, `itemType?`, `profileDecorationId?`, `thumbnailAttachmentId?` | `{ board: BoardResponseDTO }` |
| `GET` | `/api/cite/board/{id}` | 🔵 로그인 | 게시글 상세 | — | `{ board: BoardResponseDTO }` |
| `PUT` | `/api/cite/board/{id}` | 🔵 로그인 | 게시글 수정 (작성자 또는 ADMIN) | `categoryId`, `title`, `content`, `tagId?`, `attachmentIds?`, `pinned?`, `itemPrice?`, `itemType?`, `profileDecorationId?`, `thumbnailAttachmentId?` | `{ board: BoardResponseDTO }` |
| `DELETE` | `/api/cite/board/{id}` | 🔵 로그인 | 게시글 삭제 (작성자 또는 ADMIN) | — | 메시지 |
| `PATCH` | `/api/cite/board/{id}/pin` | 🔴 ADMIN | 고정 토글 (ADMIN) <sup>[1]</sup> | — | `{ board }` |
| `GET` | `/api/cite/board/my/board-count` | 🔵 로그인 | 내 게시글 수 | — | `{ postCount }` |
| `GET` | `/api/cite/board/user/{nickname}` | 🔵 로그인 | 특정 회원의 작성글 | — | [BoardResponseDTO](#boardresponsedto) |
| `GET` | `/api/cite/board/my/boards` | 🔵 로그인 | 내 작성글 | — | [BoardResponseDTO](#boardresponsedto) |
| `DELETE` | `/api/cite/board/my/boards` | 🔵 로그인 | 내 작성글 일괄 삭제 | Body [BoardDeleteRequest](#boarddeleterequest) | 메시지 |
| `GET` | `/api/cite/board/my/commented-boards` | 🔵 로그인 | 내가 댓글 단 게시글 | — | [BoardResponseDTO](#boardresponsedto) |
| `GET` | `/api/cite/board/recent-boards` | 🔵 로그인 | 최근 게시글 (홈) | `page` `size` `sort` | [BoardListResponseDTO](#boardlistresponsedto) |
| `GET` | `/api/admin/boards/tag-stats` | 🔴 ADMIN | 카테고리의 태그별 게시글 수 (ACTIVE / HIDDEN) | `categoryId` | `{ activeCount, categoryId, hiddenCount, tagId, tagName, tagStats }` · raw |
| `PUT` | `/api/admin/boards/deactivate-by-tag` | 🔴 ADMIN | 태그 단위로 게시글 숨김 (ACTIVE → HIDDEN) | `categoryId`, `tagId` | `{ affectedCount }` · raw |
| `PUT` | `/api/admin/boards/activate-by-tag` | 🔴 ADMIN | 태그 단위로 게시글 복구 (HIDDEN → ACTIVE) | `categoryId`, `tagId` | `{ affectedCount }` · raw |
| `GET` | `/api/download/{fileName:.+}` | 🔵 로그인 | 로컬 저장 파일 다운로드 (레거시, `UUID_원본명`) | — | 파일 스트림 |

<sub>[1] `PATCH /api/cite/board/{id}/pin` — URL 규칙은 로그인이지만 컨트롤러에서 ADMIN 검사</sub><br>

<a id="category"></a>

## 카테고리

<sub>[`CategoryController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/board/controller/CategoryController.java)</sub>

| Method | Endpoint | 권한 | 설명 | 요청 | 응답 |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/cite/category` | 🟢 공개 | 활성 카테고리 목록 | — | [CategoryResponseDTO](#categoryresponsedto) |
| `GET` | `/api/cite/category/all` | 🔴 ADMIN | 전체 카테고리 (비활성 포함) <sup>[1]</sup> | — | [CategoryResponseDTO](#categoryresponsedto) |
| `GET` | `/api/cite/category/slug/{slug}` | 🟢 공개 | slug로 카테고리 조회 | — | [CategoryResponseDTO](#categoryresponsedto) |
| `POST` | `/api/cite/category` | 🔴 ADMIN | 카테고리 생성 | Body [CategoryCreateDTO](#categorycreatedto) | [CategoryResponseDTO](#categoryresponsedto) |
| `PUT` | `/api/cite/category/{id}` | 🔴 ADMIN | 카테고리 수정 | Body [CategoryUpdateDTO](#categoryupdatedto) | [CategoryResponseDTO](#categoryresponsedto) |
| `DELETE` | `/api/cite/category/{id}` | 🔴 ADMIN | 카테고리 삭제 | — | 메시지 |
| `PUT` | `/api/cite/category/sort-order` | 🔴 ADMIN | 카테고리 순서 일괄 변경 | Body [CategorySortOrderDTO[]](#categorysortorderdto) | 메시지 |
| `POST` | `/api/cite/category/enable-shop/{id}` | 🔴 ADMIN | 카테고리에 상점 기능 켜기 | — | [CategoryResponseDTO](#categoryresponsedto) |

<sub>[1] `GET /api/cite/category/all` — URL 규칙상 공개지만 서비스에서 관리자 검사</sub><br>

<a id="comment"></a>

## 댓글

<sub>[`CommentController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/comment/controller/CommentController.java)</sub>

| Method | Endpoint | 권한 | 설명 | 요청 | 응답 |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/board/{boardId}/comments` | 🔵 로그인 | 댓글 · 대댓글(`parentId`) 작성 → 작성자에게 알림 | Body [CommentCreateRequest](#commentcreaterequest) | `{ comment }` · [CommentResponse](#commentresponse) |
| `GET` | `/api/board/{boardId}/comments` | 🔵 로그인 | 게시글 댓글 트리 | — | `{ comments }` · [CommentResponse](#commentresponse) |
| `GET` | `/api/my-page/comments` | 🔵 로그인 | 내 댓글 목록 | — | `{ comments }` |
| `PATCH` | `/api/comments/{commentId}` | 🔵 로그인 | 댓글 수정 | Body [CommentUpdateRequest](#commentupdaterequest) | `{ comment }` · [CommentResponse](#commentresponse) |
| `PATCH` | `/api/comments/{commentId}/status` | 🔴 ADMIN | 댓글 숨김 / 공개 | Body [CommentStatusUpdateRequest](#commentstatusupdaterequest) | `{ comment }` · [CommentResponse](#commentresponse) |
| `DELETE` | `/api/comments/{commentId}` | 🔵 로그인 | 댓글 삭제 (소프트 삭제) | — | 메시지 |
| `GET` | `/api/comments/my/count` | 🔵 로그인 | 내 댓글 수 | — | `{ commentCount }` |
| `DELETE` | `/api/my-page/comments` | 🔵 로그인 | 내 댓글 일괄 삭제 | Body [MyCommentsDeleteRequest](#mycommentsdeleterequest) | 메시지 |
| `GET` | `/api/comments/user/{nickname}` | 🔵 로그인 | 특정 회원의 댓글 <sup>[1]</sup> | — | `{ comments }` · [MyCommentResponse](#mycommentresponse) |

<sub>[1] `GET /api/comments/user/{nickname}` — 코드 주석은 '인증 불필요'지만 실제로는 로그인 필요</sub><br>

<a id="like"></a>

## 좋아요

<sub>[`BoardLikeController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/like/controller/BoardLikeController.java), [`CommentLikeController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/like/controller/CommentLikeController.java)</sub>

| Method | Endpoint | 권한 | 설명 | 요청 | 응답 |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/like/board/user/{nickname}/liked` | 🔵 로그인 | 특정 회원이 좋아요한 게시글 <sup>[1]</sup> | — | `{ boards }` · [BoardResponseDTO](#boardresponsedto) |
| `GET` | `/api/like/board/{boardId}/likeStatus` | 🔵 로그인 | 좋아요 수 + 내 좋아요 여부 | — | [BoardLikeResponse](#boardlikeresponse) |
| `GET` | `/api/like/board/{boardId}/likeCount` | 🔵 로그인 | 게시글 좋아요 수 | — | [BoardLikeResponse](#boardlikeresponse) |
| `POST` | `/api/like/board/{boardId}` | 🔵 로그인 | 게시글 좋아요 토글 → 작성자에게 알림 | — | [BoardLikeResponse](#boardlikeresponse) |
| `GET` | `/api/like/board/totalLikes` | 🔵 로그인 | 내가 받은 좋아요 합계 | — | [BoardLikeResponse](#boardlikeresponse) |
| `GET` | `/api/like/board/pushedLikes` | 🔵 로그인 | 내가 좋아요한 게시글 | — | `{ boards }` · [BoardResponseDTO](#boardresponsedto) |
| `GET` | `/api/like/board/pushedLikes/count` | 🔵 로그인 | 내가 좋아요한 게시글 수 | — | `{ likeCount }` |
| `POST` | `/api/like/comment/{commentId}` | 🔵 로그인 | 댓글 좋아요 토글 → 작성자에게 알림 | — | [CommentLikeResponse](#commentlikeresponse) |
| `GET` | `/api/like/comment/{commentId}/likeCount` | 🔵 로그인 | 댓글 좋아요 수 | — | [CommentLikeResponse](#commentlikeresponse) |

<sub>[1] `GET /api/like/board/user/{nickname}/liked` — 코드 주석은 '인증 불필요'지만 실제로는 로그인 필요</sub><br>

<a id="attachment"></a>

## 첨부파일 · S3

<sub>[`AttachmentController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/attachment/controller/AttachmentController.java)</sub>

| Method | Endpoint | 권한 | 설명 | 요청 | 응답 |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/cite/attachments/upload` | 🔵 로그인 | (레거시) 서버 경유 multipart 업로드, 이미지는 재인코딩 | multipart: `file`, `boardId?`, `categoryId` | `{ attachmentId }` |
| `GET` | `/api/cite/attachments/{id}` | 🔵 로그인 | 첨부 메타데이터 | — | `{ attachment }` · [AttachmentResponseDto](#attachmentresponsedto) |
| `GET` | `/api/cite/attachments/{id}/download` | 🔵 로그인 | 다운로드. S3면 Presigned URL로 302 리다이렉트 | `disposition?` | 302 → Presigned URL / 파일 스트림 |
| `GET` | `/api/cite/attachments/{id}/download-url` | 🟢 공개 | Presigned GET URL만 반환 | — | `{ downloadUrl }` |
| `GET` | `/api/cite/attachments/my` | 🔵 로그인 | 내 첨부 목록 | — | `{ attachments }` · [AttachmentResponseDto](#attachmentresponsedto) |
| `DELETE` | `/api/cite/attachments` | 🔵 로그인 | 첨부 일괄 삭제 (본인 파일, S3 객체 포함) | Body [AttachmentDeleteRequestDto](#attachmentdeleterequestdto) | 메시지 |
| `POST` | `/api/cite/attachments/presigned` | 🔵 로그인 | S3 업로드용 Presigned PUT URL 발급 (10분) | `type` = profile · profile-decoration · board · file, `fileName` | `{ uploadUrl }` |
| `POST` | `/api/cite/attachments/register` | 🔵 로그인 | S3 업로드 완료 후 메타데이터를 DB에 등록 | Body [AttachmentRegisterRequestDto](#attachmentregisterrequestdto) | `{ attachmentId }` |

<a id="notification"></a>

## 알림 · SSE

<sub>[`AlarmController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/alarm/controller/AlarmController.java), [`NotificationController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/notification/controller/NotificationController.java)</sub>

| Method | Endpoint | 권한 | 설명 | 요청 | 응답 |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/alarm/subscribe` | 🔵 로그인 | SSE 구독. 이벤트 `connect` · `notification`, 24시간 유지 | — | `text/event-stream` |
| `GET` | `/api/notifications` | 🔵 로그인 | 알림 목록 (최신순) | — | [NotificationResponse](#notificationresponse) |
| `GET` | `/api/notifications/unRead` | 🔵 로그인 | 안 읽은 알림 | — | [NotificationResponse](#notificationresponse) |
| `PATCH` | `/api/notifications/{notificationId}/read` | 🔵 로그인 | 알림 읽음 처리 | — | 메시지 |
| `PATCH` | `/api/notifications/readAll` | 🔵 로그인 | 전체 읽음 처리 | — | 메시지 |
| `GET` | `/api/notifications/hasUnread` | 🔵 로그인 | 안 읽은 알림 수 · 여부 | — | `{ unReadCount, hasUnRead }` |
| `DELETE` | `/api/notifications/{notificationId}` | 🔵 로그인 | 알림 삭제 | — | 메시지 |

<a id="attendance"></a>

## 출석

<sub>[`AttendanceController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/attendance/controller/AttendanceController.java)</sub>

| Method | Endpoint | 권한 | 설명 | 요청 | 응답 |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/cite/attendance/checkIn` | 🔵 로그인 | 출석 체크 (로그인 시에도 자동 실행) | — | 메시지 |
| `GET` | `/api/cite/attendance/today` | 🟢 공개 | 오늘 출석자 (홈) | — | [TodayVisitorResponse](#todayvisitorresponse) |
| `GET` | `/api/cite/attendance/rank/consecutive` | 🔵 로그인 | 연속 출석 TOP 5 | — | `Attendance[]` |
| `GET` | `/api/cite/attendance/rank/total` | 🔵 로그인 | 누적 출석 TOP 5 | — | `Attendance[]` |
| `GET` | `/api/cite/attendance/me` | 🔵 로그인 | 내 출석 현황 | — | `Attendance` |
| `GET` | `/api/cite/attendance/me/logs` | 🔵 로그인 | 내 출석 로그 | — | `AttendanceLog[]` |
| `GET` | `/api/cite/attendance` | 🔵 로그인 | 내 누적 방문 수 | — | `{ visitCount }` |

<a id="point"></a>

## 마일리지 · 상점

<sub>[`PointController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/point/controller/PointController.java), [`PointUsageController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/point/usage/controller/PointUsageController.java)</sub>

| Method | Endpoint | 권한 | 설명 | 요청 | 응답 |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/cite/point` | 🔵 로그인 | 내 마일리지 잔액 | — | [BalanceResponse](#balanceresponse) |
| `GET` | `/api/cite/point/allBalance` | 🔴 ADMIN | 전체 회원 잔액 | — | [BalanceResponse](#balanceresponse) |
| `GET` | `/api/cite/point/pointDetails` | 🔵 로그인 | 내 적립 · 사용 내역 | — | [PointDetailResponse](#pointdetailresponse) |
| `POST` | `/api/cite/point` | 🔴 ADMIN | 수동 지급 · 차감 (학번 기준) | Body [ManualBalanceUpdateRequest](#manualbalanceupdaterequest) | [BalanceResponse](#balanceresponse) |
| `POST` | `/api/cite/point/bulk` | 🔴 ADMIN | 일괄 지급 | Body [ManualBalanceUpdateRequest[]](#manualbalanceupdaterequest) | [BalanceResponse](#balanceresponse) |
| `GET` | `/api/cite/point/user/{nickname}` | 🔵 로그인 | 특정 회원 잔액 <sup>[1]</sup> | — | [BalanceResponse](#balanceresponse) |
| `GET` | `/api/cite/point/user/{nickname}/details` | 🔵 로그인 | 특정 회원 내역 <sup>[2]</sup> | — | [PointDetailResponse](#pointdetailresponse) |
| `POST` | `/api/cite/board/{id}/purchase` | 🔵 로그인 | 상점 게시글의 아이템 구매 (마일리지 차감, 배지는 보유 등록) | — | [PointUsageResponse](#pointusageresponse) |

<sub>[1] `GET /api/cite/point/user/{nickname}` — 코드 주석은 '인증 불필요'지만 실제로는 로그인 필요</sub><br>
<sub>[2] `GET /api/cite/point/user/{nickname}/details` — 코드 주석은 '인증 불필요'지만 실제로는 로그인 필요</sub><br>

<a id="decoration"></a>

## 프로필 장식 · 배지

<sub>[`ProfileDecorationController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/profiledecoration/controller/ProfileDecorationController.java)</sub>

| Method | Endpoint | 권한 | 설명 | 요청 | 응답 |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/cite/profile-decorations` | 🟢 공개 | 활성 장식 목록 | — | [ProfileDecorationDto](#profiledecorationdto) |
| `GET` | `/api/cite/profile-decorations/{key}/image` | 🟢 공개 | 장식 이미지. S3 Presigned URL로 302 리다이렉트 | — | 302 → Presigned URL |
| `GET` | `/api/cite/profile-decorations/me` | 🔵 로그인 | 내가 보유한 장식 <sup>[1]</sup> | — | [ProfileDecorationDto](#profiledecorationdto) |
| `GET` | `/api/cite/admin/profile-decorations` | 🔴 ADMIN | 전체 장식 | — | [ProfileDecorationDto](#profiledecorationdto) |
| `POST` | `/api/cite/admin/profile-decorations` | 🔴 ADMIN | 장식 등록 | Body [ProfileDecorationCreateRequest](#profiledecorationcreaterequest) | [ProfileDecorationDto](#profiledecorationdto) |
| `POST` | `/api/cite/admin/profile-decorations/ownership/grant` | 🔴 ADMIN | 학번 기준으로 장식 지급 | `{ "studentNum", "decorationId" }` | 메시지 |
| `POST` | `/api/cite/admin/profile-decorations/ownership/revoke` | 🔴 ADMIN | 학번 기준으로 장식 회수 | `{ "studentNum", "decorationId" }` | 메시지 |
| `DELETE` | `/api/cite/admin/profile-decorations/{id}` | 🔴 ADMIN | 장식 삭제 | — | 메시지 |

<sub>[1] `GET /api/cite/profile-decorations/me` — URL 규칙상 공개지만 컨트롤러에서 로그인 검사</sub><br>

<a id="tag"></a>

## 태그

<sub>[`TagController`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/tag/controller/TagController.java)</sub>

| Method | Endpoint | 권한 | 설명 | 요청 | 응답 |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/cite/tag/add-tag` | 🔴 ADMIN | 태그 추가 | Body [TagRequest](#tagrequest) | [TagResponse](#tagresponse) · raw |
| `GET` | `/api/cite/tag` | 🟢 공개 | 전체 태그 | — | [TagResponse](#tagresponse) |
| `GET` | `/api/cite/tag/{categoryId}` | 🟢 공개 | 카테고리별 태그 | — | [TagResponse](#tagresponse) |
| `DELETE` | `/api/cite/tag/{tagId}` | 🔴 ADMIN | 태그 삭제 | — | 메시지 |
| `PATCH` | `/api/cite/tag/{tagId}` | 🔴 ADMIN | 태그 수정 | Body [TagRequest](#tagrequest) | [TagResponse](#tagresponse) |

<a id="problem"></a>

## 대회 · 문제

<sub>[`ProblemController`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/problem/controller/ProblemController.java)</sub>

| Method | Endpoint | 권한 | 설명 | 요청 | 응답 |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/judge/problem` | 🔵 로그인 | 문제 목록 | `page` `size` `sort` | Page&lt;[ProblemListResponse](#problemlistresponse)&gt; |
| `GET` | `/api/judge/problem/{id}/html` | 🔵 로그인 | 문제 본문 HTML (S3에서 읽어 반환) | — | `text/html` |
| `GET` | `/api/judge/problem/{id}` | 🔵 로그인 | 문제 상세 (시간 · 메모리 제한, 점수) | — | [ViewProblemDetailsResponse](#viewproblemdetailsresponse) |
| `POST` | `/api/judge/problem` | 🔴 ADMIN | 문제 등록. ZIP(`problem.json` + `tests.zip`) 해제 후 S3 업로드 | multipart: `code` `title` `description` `timeLimit` `memoryLimit` `points` `zipFile` `isPublic` | 메시지 |
| `GET` | `/api/judge/problem/search-by-code` | 🔵 로그인 | 문제 코드로 검색 <sup>[1]</sup> | `page` `size` `sort`, Body [SearchProblemRequest](#searchproblemrequest) | Page&lt;[ProblemListResponse](#problemlistresponse)&gt; |
| `GET` | `/api/judge/problem/search-by-title` | 🔵 로그인 | 문제 제목으로 검색 <sup>[2]</sup> | `page` `size` `sort`, Body [SearchProblemRequest](#searchproblemrequest) | Page&lt;[ProblemListResponse](#problemlistresponse)&gt; |
| `POST` | `/api/judge/problem/toggle-public/{id}` | 🔵 로그인 | 문제 공개 여부 토글 <sup>[3]</sup> | — | `boolean` (변경 후 공개 여부) |
| `DELETE` | `/api/judge/problem/{id}` | 🔴 ADMIN | 문제 삭제 (S3 디렉터리 포함) | — | 메시지 |

<sub>[1] `GET /api/judge/problem/search-by-code` — GET인데 `@RequestBody`로 받음</sub><br>
<sub>[2] `GET /api/judge/problem/search-by-title` — GET인데 `@RequestBody`로 받음</sub><br>
<sub>[3] `POST /api/judge/problem/toggle-public/{id}` — ⚠ ADMIN 규칙이 `/toggle-public`(정확 일치)에만 걸려 있어 로그인 사용자 누구나 호출 가능</sub><br>

<a id="submission"></a>

## 제출 · 채점

<sub>[`SubmissionController`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/submission/controller/SubmissionController.java)</sub>

| Method | Endpoint | 권한 | 설명 | 요청 | 응답 |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/judge/submission` | 🔵 로그인 | 코드 제출. `PENDING` 저장 후 Redis Stream에 채점 요청 발행 | Body [SubmitRequest](#submitrequest) | [SubmitPendingResponse](#submitpendingresponse) |
| `POST` | `/api/judge/submission/result` | 🔵 로그인 | 채점 결과 콜백 (Judge Worker가 호출) <sup>[1]</sup> | Body [JudgeResultResponse](#judgeresultresponse) | [SubmitResult](#submitresult) |
| `GET` | `/api/judge/submission/my/status/{problemId}` | 🔵 로그인 | 문제별 내 제출 목록 | `page` `size` `sort` | Page&lt;[SubmitListResponse](#submitlistresponse)&gt; |
| `GET` | `/api/judge/submission/detail/{submissionId}` | 🔵 로그인 | 제출 소스 코드 | — | [SubDetailResponse](#subdetailresponse) |
| `GET` | `/api/judge/submission/my/status` | 🔵 로그인 | 내 풀이 현황 (맞은 · 틀린 문제 ID) | — | [UserProblemStatusResponse](#userproblemstatusresponse) |
| `GET` | `/api/judge/submission/{userId}/status` | 🔵 로그인 | 다른 회원의 풀이 현황 | — | [UserProblemStatusResponse](#userproblemstatusresponse) |

<sub>[1] `POST /api/judge/submission/result` — ⚠ `anyRequest().authenticated()`에 걸림 — 채점 서버도 인증 쿠키가 필요</sub><br>

<a id="group"></a>

## 그룹

<sub>[`GroupController`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/group/controller/GroupController.java), [`GroupMemberController`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/groupMember/controller/GroupMemberController.java), [`GroupJoinRequestController`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/groupJoinRequest/controller/GroupJoinRequestController.java)</sub>

| Method | Endpoint | 권한 | 설명 | 요청 | 응답 |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/groups` | 🔴 ADMIN | 그룹 생성 | Body [GroupCreateRequest](#groupcreaterequest) | `{ group }` · [GroupDetailResponse](#groupdetailresponse) |
| `GET` | `/api/groups` | 🔴 ADMIN | 그룹 목록 (`keyword` 검색) | `keyword?` | `{ groups }` · [GroupListResponse](#grouplistresponse) |
| `GET` | `/api/groups/{groupId}` | 🔵 로그인 | 그룹 상세 (멤버 포함) | — | `{ group }` · [GroupDetailResponse](#groupdetailresponse) |
| `PATCH` | `/api/groups/{groupId}` | 🔵 로그인 | 그룹 수정 | Body [GroupUpdateRequest](#groupupdaterequest) | 메시지 |
| `DELETE` | `/api/groups/{groupId}` | 🔵 로그인 | 그룹 삭제 | — | 메시지 |
| `GET` | `/api/groups/{groupId}/members` | 🔵 로그인 | 멤버 목록 | — | `{ members }` · [GroupMemberResponse](#groupmemberresponse) |
| `DELETE` | `/api/groups/{groupId}/members/me` | 🔵 로그인 | 그룹 탈퇴 | — | 메시지 |
| `DELETE` | `/api/groups/{groupId}/members/{targetUserId}` | 🔵 로그인 | 멤버 내보내기 | — | 메시지 |
| `POST` | `/api/groups/{groupId}/join-requests/apply` | 🔵 로그인 | 가입 신청 | — | `{ requestId }` |
| `POST` | `/api/groups/{groupId}/join-requests/invite` | 🔵 로그인 | 회원 초대 | `inviteeId` | `{ requestId }` |
| `GET` | `/api/groups/{groupId}/join-requests` | 🔵 로그인 | 대기 중인 가입 요청 (그룹장) | — | `{ requests }` |
| `POST` | `/api/groups/{groupId}/join-requests/{requestId}/accept` | 🔵 로그인 | 가입 요청 수락 | — | 메시지 |
| `POST` | `/api/groups/{groupId}/join-requests/{requestId}/reject` | 🔵 로그인 | 가입 요청 거절 | — | 메시지 |
| `DELETE` | `/api/groups/{groupId}/join-requests/{requestId}` | 🔵 로그인 | 가입 신청 취소 (신청자 본인) | — | 메시지 |

<a id="schemas"></a>

## 스키마

굵은 필드는 Bean Validation(`@NotBlank` · `@NotNull` 등)이 걸린 필수 값입니다.

### 요청 DTO (24)

#### AttachmentDeleteRequestDto

<sub>[`AttachmentDeleteRequestDto.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/attachment/dto/AttachmentDeleteRequestDto.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `fileIds` | `List&lt;Long&gt;` |

#### AttachmentRegisterRequestDto

<sub>[`AttachmentRegisterRequestDto.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/attachment/dto/AttachmentRegisterRequestDto.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `key` | `String` |
| `originFilename` | `String` |
| `fileSize` | `Long` |
| `boardId` | `Long` |
| `categoryId` | `Long` |

#### BoardDeleteRequest

<sub>[`BoardDeleteRequest.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/board/dto/BoardDeleteRequest.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `boardIds` | `List&lt;Long&gt;` |

#### CategoryCreateDTO

<sub>[`CategoryCreateDTO.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/board/dto/CategoryCreateDTO.java)</sub>

| 필드 | 타입 |
| --- | --- |
| **`name`** | `String` · 길이 제한 |
| **`slug`** | `String` · 길이 제한 |
| `parentId` | `Long` |
| `sortOrder` | `Integer` |
| `isActive` | `Boolean` |
| `availableTags` | `List&lt;String&gt;` |
| `redirectUrl` | `String` · 길이 제한 |
| `shopEnabled` | `Boolean` |

#### CategorySortOrderDTO

<sub>[`CategorySortOrderDTO.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/board/dto/CategorySortOrderDTO.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `id` | `Long` |
| `sortOrder` | `Integer` |

#### CategoryUpdateDTO

<sub>[`CategoryUpdateDTO.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/board/dto/CategoryUpdateDTO.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `name` | `String` · 길이 제한 |
| `slug` | `String` · 길이 제한 |
| `parentId` | `Long` |
| `sortOrder` | `Integer` |
| `isActive` | `Boolean` |
| `availableTags` | `List&lt;Tag&gt;` |
| `redirectUrl` | `String` · 길이 제한 |
| `shopEnabled` | `Boolean` |

#### ChangePasswordRequest

<sub>[`ChangePasswordRequest.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/user/dto/ChangePassword/ChangePasswordRequest.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `password` | `String` |

#### CheckAuthCodeRequest

<sub>[`CheckAuthCodeRequest.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/user/dto/ChangePassword/CheckAuthCodeRequest.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `authCode` | `String` |

#### CheckUserValidateRequest

<sub>[`CheckUserValidateRequest.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/user/dto/ChangePassword/CheckUserValidateRequest.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `userId` | `String` |
| `studentNum` | `String` |
| `email` | `String` |

#### CommentCreateRequest

<sub>[`CommentCreateRequest.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/comment/dto/CommentCreateRequest.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `parentId` | `Long` |
| **`context`** | `String` · 길이 제한 |

#### CommentStatusUpdateRequest

<sub>[`CommentStatusUpdateRequest.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/comment/dto/CommentStatusUpdateRequest.java)</sub>

| 필드 | 타입 |
| --- | --- |
| **`status`** | `STATUS` |

#### CommentUpdateRequest

<sub>[`CommentUpdateRequest.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/comment/dto/CommentUpdateRequest.java)</sub>

| 필드 | 타입 |
| --- | --- |
| **`context`** | `String` · 길이 제한 |

#### GroupCreateRequest

<sub>[`GroupCreateRequest.java`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/group/dto/GroupCreateRequest.java)</sub>

| 필드 | 타입 |
| --- | --- |
| **`name`** | `String` · 길이 제한 |
| **`capacity`** | `Integer` |
| `description` | `String` · 길이 제한 |

#### GroupUpdateRequest

<sub>[`GroupUpdateRequest.java`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/group/dto/GroupUpdateRequest.java)</sub>

| 필드 | 타입 |
| --- | --- |
| **`name`** | `String` · 길이 제한 |
| **`capacity`** | `Integer` |
| `description` | `String` · 길이 제한 |

#### LoginDTO

<sub>[`LoginDTO.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/user/dto/LoginDTO.java)</sub>

| 필드 | 타입 |
| --- | --- |
| **`userId`** | `String` · 길이 제한 |
| **`password`** | `String` · 길이 제한 |

#### ManualBalanceUpdateRequest

<sub>[`ManualBalanceUpdateRequest.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/point/dto/ManualBalanceUpdateRequest.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `studentNum` | `String` |
| `description` | `String` |
| `amount` | `Long` |

#### MyCommentsDeleteRequest

<sub>[`MyCommentsDeleteRequest.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/comment/dto/MyCommentsDeleteRequest.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `commentIds` | `List&lt;Long&gt;` |

#### ProfileDecorationCreateRequest

<sub>[`ProfileDecorationCreateRequest.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/profiledecoration/dto/ProfileDecorationCreateRequest.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `key` | `String` |
| `label` | `String` |
| `filePath` | `String` |
| `requiredRole` | `String` |
| `purchaseRequired` | `Boolean` |

#### ProfileDecorationDto

<sub>[`ProfileDecorationDto.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/profiledecoration/dto/ProfileDecorationDto.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `id` | `Long` |
| `key` | `String` |
| `label` | `String` |
| `src` | `String` |
| `requiredRole` | `String` |
| `purchaseRequired` | `boolean` |
| `active` | `boolean` |

#### RegisterDTO

<sub>[`RegisterDTO.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/user/dto/RegisterDTO.java)</sub>

| 필드 | 타입 |
| --- | --- |
| **`userId`** | `String` · 길이 제한 |
| **`name`** | `String` · 길이 제한 |
| **`nickname`** | `String` · 길이 제한 |
| **`password`** | `String` · 길이 제한 |
| **`studentNum`** | `String` · 길이 제한 |
| **`email`** | `String` · email |
| **`major`** | `String` · 길이 제한 |
| `birth` | `String` |
| `bojId` | `String` |

#### SearchProblemRequest

<sub>[`SearchProblemRequest.java`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/problem/dto/SearchProblemRequest.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `title` | `String` |
| `code` | `String` |

#### SubmitRequest

<sub>[`SubmitRequest.java`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/submission/dto/SubmitRequest.java)</sub>

| 필드 | 타입 |
| --- | --- |
| **`problemId`** | `Long` |
| **`language`** | `String` |
| **`sourceCode`** | `String` |

#### TagRequest

<sub>[`TagRequest.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/tag/dto/TagRequest.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `name` | `String` |
| `categoryId` | `Long` |
| `sortValue` | `Integer` |

#### UpdateProfileDTO

<sub>[`UpdateProfileDTO.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/user/dto/UpdateProfileDTO.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `nickname` | `String` · 길이 제한 |
| `bojId` | `String` · 길이 제한 |
| `birth` | `String` · 길이 제한 |
| `major` | `String` · 길이 제한 |
| `studentNum` | `String` · 길이 제한 |

### 응답 DTO (31)

#### AdminUserDetailResponseDTO

<sub>[`AdminUserDetailResponseDTO.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/user/dto/AdminUserDetailResponseDTO.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `id` | `Long` |
| `userId` | `String` |
| `name` | `String` |
| `nickname` | `String` |
| `email` | `String` |
| `studentNum` | `String` |
| `major` | `String` |
| `birth` | `String` |
| `status` | `ApprovalStatus` |
| `createdAt` | `LocalDateTime` |
| `updatedAt` | `LocalDateTime` |
| `roles` | `List&lt;String&gt;` |
| `profileImage` | `String` |
| `profileDecoration` | `String` |

#### AdminUserListResponseDTO

<sub>[`AdminUserListResponseDTO.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/user/dto/AdminUserListResponseDTO.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `id` | `Long` |
| `nickname` | `String` |
| `email` | `String` |
| `createdAt` | `LocalDateTime` |

#### AttachmentResponseDto

<sub>[`AttachmentResponseDto.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/attachment/dto/AttachmentResponseDto.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `id` | `Long` |
| `originFilename` | `String` |
| `storedFilename` | `String` |
| `filepath` | `String` |
| `extension` | `String` |
| `fileSize` | `Long` |
| `boardId` | `Long` |
| `categoryId` | `Long` |
| `userId` | `Long` |
| `disposition` | `String` |
| `downloadUrl` | `String` |
| `createdAt` | `LocalDateTime` |

#### BalanceResponse

<sub>[`BalanceResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/point/dto/BalanceResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `totalAmount` | `Long` |
| `updatedAt` | `LocalDateTime` |

#### BoardLikeResponse

<sub>[`BoardLikeResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/like/dto/BoardLikeResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `message` | `String` |
| `likeCount` | `long` |
| `isLiked` | `boolean` |

#### BoardListResponseDTO

<sub>[`BoardListResponseDTO.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/board/dto/BoardListResponseDTO.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `posts` | `List&lt;BoardResponseDTO&gt;` |
| `totalElements` | `Long` |
| `totalPages` | `Integer` |
| `currentPage` | `Integer` |
| `category` | `CategoryResponseDTO` |

#### BoardResponseDTO

<sub>[`BoardResponseDTO.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/board/dto/BoardResponseDTO.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `id` | `Long` |
| `title` | `String` |
| `content` | `String` |
| `category` | `CategoryResponseDTO` |
| `author` | `AuthorInfo` |
| `views` | `Integer` |
| `isLiked` | `Boolean` |
| `likeCount` | `Long` |
| `commentCount` | `Long` |
| `pinned` | `Boolean` |
| `tag` | `TagInfo` |
| `filename` | `String` |
| `filepath` | `String` |
| `itemPrice` | `Long` |
| `itemType` | `String` |
| `profileDecoration` | `ProfileDecorationInfo` |
| `thumbnailAttachmentId` | `Long` |
| `attachments` | `List&lt;AttachmentResponseDto&gt;` |
| `createdAt` | `LocalDateTime` |
| `updatedAt` | `LocalDateTime` |
| `id` | `Long` |
| `tagName` | `String` |
| `id` | `Long` |
| `userId` | `String` |
| `nickname` | `String` |
| `email` | `String` |
| `profileImage` | `String` |
| `profileDecoration` | `String` |
| `id` | `Long` |
| `key` | `String` |
| `label` | `String` |
| `src` | `String` |

#### CategoryResponseDTO

<sub>[`CategoryResponseDTO.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/board/dto/CategoryResponseDTO.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `id` | `Long` |
| `parentId` | `Long` |
| `name` | `String` |
| `slug` | `String` |
| `isActive` | `Boolean` |
| `sortOrder` | `Integer` |
| `postCount` | `Integer` |
| `redirectUrl` | `String` |
| `shopEnabled` | `Boolean` |
| `createdAt` | `LocalDateTime` |
| `updatedAt` | `LocalDateTime` |

#### CheckUserValidateResponse

<sub>[`CheckUserValidateResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/user/dto/ChangePassword/CheckUserValidateResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `isValidateUserId` | `boolean` |
| `isValidateStudentNum` | `boolean` |
| `isValidateEmail` | `boolean` |

#### CommentLikeResponse

<sub>[`CommentLikeResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/like/dto/CommentLikeResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `message` | `String` |
| `likeCount` | `Long` |
| `isLiked` | `Boolean` |

#### CommentResponse

<sub>[`CommentResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/comment/dto/CommentResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `id` | `Long` |
| `parentId` | `Long` |
| `authorName` | `String` |
| `authorProfileImage` | `String` |
| `authorProfileDecoration` | `String` |
| `status` | `STATUS` |
| `context` | `String` |
| `createdAt` | `String` |
| `updatedAt` | `String` |
| `likeCount` | `Integer` |
| `isDeleted` | `Boolean` |
| `isLiked` | `Boolean` |
| `editable` | `Boolean` |
| `deletable` | `Boolean` |
| `hideable` | `Boolean` |
| `children` | `List&lt;CommentResponse&gt;` |

#### GroupDetailResponse

<sub>[`GroupDetailResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/group/dto/GroupDetailResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `id` | `Long` |
| `name` | `String` |
| `capacity` | `Integer` |
| `currentMemberCount` | `Integer` |
| `description` | `String` |
| `members` | `List&lt;GroupMemberResponse&gt;` |

#### GroupListResponse

<sub>[`GroupListResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/group/dto/GroupListResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `id` | `Long` |
| `name` | `String` |
| `capacity` | `Integer` |
| `currentMemberCount` | `Integer` |
| `description` | `String` |

#### GroupMemberResponse

<sub>[`GroupMemberResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/groupMember/dto/GroupMemberResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `id` | `Long` |
| `userId` | `Long` |
| `nickname` | `String` |
| `role` | `MemberRole` |

#### JudgeResultResponse

<sub>[`JudgeResultResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/submission/dto/judge/JudgeResultResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `submissionId` | `Long` |
| `status` | `SubmissionStatus` |
| `executionTimeMs` | `Integer` |
| `usedMemoryKb` | `Integer` |
| `errorMessage` | `String` |

#### LoginResponseDTO

<sub>[`LoginResponseDTO.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/user/dto/LoginResponseDTO.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `accessToken` | `String` |
| `user` | `UserInfo` |
| `id` | `Long` |
| `userId` | `String` |
| `nickname` | `String` |
| `email` | `String` |
| `profileImage` | `String` |
| `profileDecoration` | `String` |
| `roles` | `List&lt;String&gt;` |

#### MyCommentResponse

<sub>[`MyCommentResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/comment/dto/MyCommentResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `id` | `Long` |
| `context` | `String` |
| `likeCount` | `int` |
| `createdAt` | `String` |
| `boardId` | `Long` |

#### MyPageResponseDTO

<sub>[`MyPageResponseDTO.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/user/dto/MyPageResponseDTO.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `userId` | `String` |
| `name` | `String` |
| `nickname` | `String` |
| `email` | `String` |
| `major` | `String` |
| `bojId` | `String` |
| `birth` | `String` |
| `studentNum` | `String` |
| `emailHide` | `boolean` |
| `profileImage` | `String` |
| `profileDecoration` | `String` |

#### NotificationResponse

<sub>[`NotificationResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/notification/dto/NotificationResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `id` | `Long` |
| `unReadCount` | `Long` |
| `senderNickName` | `String` |
| `senderProfileImage` | `String` |
| `message` | `String` |
| `url` | `String` |
| `hasUnRead` | `Boolean` |
| `createdAt` | `LocalDateTime` |
| `isRead` | `Boolean` |

#### PointDetailResponse

<sub>[`PointDetailResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/point/dto/PointDetailResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `createdAt` | `LocalDateTime` |
| `amount` | `Long` |
| `expiredAt` | `LocalDateTime` |
| `remainingAmount` | `Long` |
| `description` | `String` |

#### PointUsageResponse

<sub>[`PointUsageResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/point/usage/dto/PointUsageResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `boardId` | `Long` |
| `itemName` | `String` |
| `price` | `Long` |
| `remainingAmount` | `Long` |
| `itemType` | `String` |
| `profileDecorationKey` | `String` |

#### ProblemListResponse

<sub>[`ProblemListResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/problem/dto/ProblemListResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `id` | `Long` |
| `title` | `String` |
| `points` | `Integer` |
| `createdAt` | `DateTime` |
| `code` | `String` |

#### SubDetailResponse

<sub>[`SubDetailResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/submission/dto/SubDetailResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `sourceCode` | `String` |

#### SubmitListResponse

<sub>[`SubmitListResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/submission/dto/SubmitListResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `submissionId` | `Long` |
| `problemId` | `Long` |
| `problemTitle` | `String` |
| `userId` | `Long` |
| `language` | `String` |
| `createdAt` | `LocalDateTime` |
| `status` | `SubmissionStatus` |
| `executionTimeMs` | `Integer` |
| `usedMemoryKb` | `Integer` |
| `errorMessage` | `String` |

#### SubmitPendingResponse

<sub>[`SubmitPendingResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/submission/dto/SubmitPendingResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `submissionId` | `Long` |
| `status` | `SubmissionStatus` |
| `message` | `String` |

#### SubmitResult

<sub>[`SubmitResult.java`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/submission/dto/SubmitResult.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `submissionId` | `Long` |
| `problemId` | `Long` |
| `userId` | `Long` |
| `language` | `String` |
| `sourceCode` | `String` |
| `createdAt` | `LocalDateTime` |
| `status` | `SubmissionStatus` |
| `executionTimeMs` | `Integer` |
| `usedMemoryKb` | `Integer` |
| `errorMessage` | `String` |

#### TagResponse

<sub>[`TagResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/tag/dto/TagResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `id` | `Long` |
| `tagName` | `String` |
| `sortValue` | `Integer` |
| `categoryName` | `String` |
| `categoryId` | `Long` |

#### TodayVisitorResponse

<sub>[`TodayVisitorResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/domain/attendance/dto/TodayVisitorResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `id` | `Long` |
| `userName` | `String` |
| `profileImageUrl` | `String` |
| `profileDecoration` | `String` |

#### UserProblemStatusResponse

<sub>[`UserProblemStatusResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/submission/dto/UserProblemStatusResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `solvedProblems` | `List&lt;Long&gt;` |
| `incorrectProblems` | `List&lt;Long&gt;` |

#### UserSuggestionResponseDTO

<sub>[`UserSuggestionResponseDTO.java`](../NimdaConBackEnd/backend-spring/src/main/java/com/nimda/cite/user/dto/UserSuggestionResponseDTO.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `studentNum` | `String` |
| `name` | `String` |

#### ViewProblemDetailsResponse

<sub>[`ViewProblemDetailsResponse.java`](../NimdaConBackEnd/backend-spring/src/main/java/judgeServer/domain/problem/dto/ViewProblemDetailsResponse.java)</sub>

| 필드 | 타입 |
| --- | --- |
| `title` | `String` |
| `description` | `String` |
| `timeLimit` | `Double` |
| `memoryLimit` | `Double` |
| `points` | `Integer` |
| `createdAt` | `LocalDateTime` |

### Enum

| Enum | 의미 | 값 |
| --- | --- | --- |
| `ApprovalStatus` | 가입 승인 상태 | PENDING · APPROVED · REJECTED |
| `BoardStatus` | 게시글 상태 | ACTIVE · HIDDEN · DELETED |
| `STATUS (comment)` | 댓글 상태 | PUBLIC · HIDDEN · DELETED |
| `ShopItemType` | 상점 아이템 | GENERAL · BADGE |
| `NotificationType` | 알림 종류 | PushLikeButtonAtBoard · PushLikeButtonAtComment · AddCommentAtBoard · AddChildComment · NoticePost |
| `PointTypes` | 마일리지 사유 (기본 지급액) | ATTENDANCE(10) · ALGORITHM(20) · STUDY_PARTICIPATION(20) · MANUAL(0) |
| `SupportedLanguage` | 제출 언어 | JAVA · PYTHON3 · CPP(C++17) · C(C99) |
| `SubmissionStatus` | 채점 상태 | PENDING · JUDGING · ACCEPTED · WRONG_ANSWER · TIME_LIMIT_EXCEEDED · MEMORY_LIMIT_EXCEEDED · COMPILE_ERROR · RUNTIME_ERROR |
| `JoinType / JoinRequestStatus` | 그룹 가입 | APPLY · INVITE / PENDING · ACCEPTED · REJECTED · CANCELED |
| `MemberRole` | 그룹 역할 | LEADER · MEMBER |

---

<sub>이 문서는 컨트롤러 소스에서 자동 추출한 결과를 바탕으로 작성했습니다. 엔드포인트가 바뀌면 함께 갱신해 주세요.</sub>
