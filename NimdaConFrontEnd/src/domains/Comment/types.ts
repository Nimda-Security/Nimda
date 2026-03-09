// Comment 도메인 타입 정의

/**
 * 댓글 상태 타입
 */
export type CommentStatus = 'PUBLIC' | 'PRIVATE' | 'DELETED' | 'HIDDEN';

/**
 * 공통 댓글 인터페이스 (CommentResponse))
 */
interface BaseCommentResponse {
  id: number;
  parentId: number | null;
  authorName: string;
  authorProfileImage: string | null;
  context: string;
  createdAt: string;
  updatedAt: string | null;
  likeCount: number;
  isDeleted: boolean;
}

/**
 * 일반 사용자용 응답 (CommentUserResponse)
 */
export interface CommentUserResponse extends BaseCommentResponse {
    editable: boolean;
    deletable: boolean;
    children: CommentUserResponse[]; // 대댓글 재귀 구조
}

/**
 * 어드민용 응답 (CommentAdminResponse)
 */
export interface CommentAdminResponse extends BaseCommentResponse {
    authorId: number;
    status: CommentStatus;
    hideable: boolean;
    children: CommentAdminResponse[];
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