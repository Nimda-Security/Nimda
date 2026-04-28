// Board 도메인 타입 정의

/**
 * 태그 엔티티 (Tag API 응답)
 */
export interface Tag {
  id: number;
  tagName: string;
  sortValue: number;
  categoryName: string;
  categoryId: number;
}

/**
 * 카테고리 정보
 */
export interface Category {
  id: number;
  parentId: number | null;
  name: string;
  isActive: boolean;
  slug: string;
  sortOrder: number;
  postCount: number;
  redirectUrl?: string | null;  // 바로가기 URL (외부 링크, null이면 일반 게시판)
  createdAt: string;
  updatedAt: string;
}

/**
 * 작성자 정보
 */
export interface BoardAuthor {
  id: number;
  userId?: string;
  nickname: string;
  email?: string;
  profileImage?: string;
  profileDecoration?: string;
}

/**
 * 게시글 상세에 포함되는 첨부 메타 (백엔드 BoardResponseDTO.attachments)
 */
export interface BoardAttachmentMeta {
  id: number;
  originFilename?: string;
  downloadUrl?: string;
  extension?: string;
  fileSize?: number;
}

/**
 * 게시글 정보
 */
export interface Board {
  id: number;
  title: string;
  content: string;
  category: Category;
  author: BoardAuthor;
  views: number;
  isLiked?: boolean; // 좋아요 상태
  likeCount?: number; // 좋아요 개수 (선택적)
  commentCount?: number; // 댓글 개수 (선택적)
  pinned: boolean;
  tag?: { id: number; tagName: string } | null; // Tag 엔티티 참조
  filename?: string | null;
  filepath?: string | null;
  /** S3+Attachment 연동 시 상세 조회에 포함 */
  attachments?: BoardAttachmentMeta[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 게시글 목록 조회 요청 파라미터
 */
export interface BoardListParams {
  categoryId?: number;
  slug?: string;
  searchKeyword?: string;
  page?: number;
  size?: number;
  sort?: 'createdAt,desc' | 'createdAt,asc' | 'title,asc' | 'title,desc';
  includeChildren?: boolean;
}

/**
 * 게시글 목록 응답
 */
export interface BoardListResponse {
  success: boolean;
  message: string;
  posts: Board[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  category: Category;
}

/**
 * 게시글 상세 응답
 */
export interface BoardDetailResponse {
  success: boolean;
  message: string;
  board: Board;
}

/**
 * 게시글 작성/수정 요청 데이터
 */
export interface BoardWriteRequest {
  categoryId: number;
  title: string;
  content: string;
  tagId?: number | null; // Tag 엔티티 ID
  /**
   * presigned→S3→register로 얻은 첨부 ID 목록. 백엔드 `attachmentIds`와 동일.
   * - 작성: 생략 시 첨부 없음.
   * - 수정: 생략 시 첨부 동기화 안 함(제목·내용만 변경). 전달 시 첨부 최종 ID 목록으로 동기화.
   */
  attachmentIds?: number[];
  pinned?: boolean; // 게시글 고정 여부 (관리자만 설정 가능)
}

/**
 * 게시글 작성/수정 응답
 */
export interface BoardWriteResponse {
  success: boolean;
  message: string;
  board: Board;
}

/**
 * 게시글 삭제 응답
 */
export interface BoardDeleteResponse {
  success: boolean;
  message: string;
}

/**
 * API 에러 응답
 */
export interface BoardErrorResponse {
  success: false;
  message: string;
}
