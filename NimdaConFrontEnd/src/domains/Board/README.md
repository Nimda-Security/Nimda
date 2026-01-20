# Board Domain - 게시판 도메인

## 📁 구조

```
src/domains/Board/
├── BoardList/        # 게시판 타입별 목록 페이지
├── BoardDetail/      # 게시글 상세 페이지
├── BoardWrite/       # 게시글 작성 페이지
├── BoardEdit/        # 게시글 수정 페이지
├── types.ts          # 타입 정의
└── constants.ts      # 상수 정의 (BoardType 등)
```

## 🛣️ 라우팅

- `/board/:boardType` - 게시판 목록 (boardType: news, academic, community, qna, free)
- `/board/:boardType/:id` - 게시글 상세
- `/board/:boardType/write` - 게시글 작성
- `/board/:boardType/edit/:id` - 게시글 수정

## 📝 사용 예시

```typescript
// 게시판 목록 페이지로 이동
navigate('/board/news');
navigate('/board/academic');

// 게시글 상세 페이지로 이동
navigate('/board/news/1');

// 게시글 작성 페이지로 이동
navigate('/board/news/write');
```

## 🔌 API

API 클라이언트는 `src/api/board.ts`에 정의되어 있습니다.

- `getBoardListAPI()` - 게시글 목록 조회
- `getBoardDetailAPI()` - 게시글 상세 조회
- `createBoardAPI()` - 게시글 작성
- `updateBoardAPI()` - 게시글 수정
- `deleteBoardAPI()` - 게시글 삭제
- `getFileDownloadURL()` - 파일 다운로드 URL 생성

## 🎯 BoardType

- `NEWS` - 새 소식
- `ACADEMIC` - 학술 게시판
- `COMMUNITY` - 커뮤니티
- `QNA` - 질문과 답변
- `FREE` - 자유 게시판

## 📋 TODO

- [ ] 작성자 확인 로직 구현 (현재 로그인 사용자와 비교)
- [ ] 게시글 조회수 기능 추가
- [ ] 댓글 기능 추가 (선택사항)
- [ ] 좋아요/추천 기능 추가 (선택사항)

