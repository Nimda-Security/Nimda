// Comment 도메인 타입 정의

/**
 * 댓글 상태 타입
 */
export type CommentStatus = 'PUBLIC' | 'DELETED' | 'HIDDEN';

/**
 * 댓글 응답 (CommentResponse)
 */
export interface CommentResponse {
  id: number;
  parentId: number | null;
  authorName: string;
  authorProfileImage: string | null;
  status: CommentStatus;
  context: string;
  createdAt: string;
  updatedAt: string | null;
  likeCount: number;
  isDeleted: boolean;

  deletable: boolean;
  editable: boolean;
  hideable: boolean;

  children: CommentResponse[]; // 대댓글 재귀 구조
}

// =============== CREATE / UPDATE (Request) ===============

/**
 * 댓글 작성 요청
 */
export interface CommentCreateRequest {
  context: string;
  parentId: number | null; // 일반 댓글은 null, 대댓글은 부모 ID
}

/**
 * 댓글 내용 수정 요청
 */
export interface CommentUpdateRequest {
  context: string;
}

/**
 * 어드민용 상태 변경 요청
 */
export interface CommentStatusUpdateRequest {
  status: CommentStatus;
}