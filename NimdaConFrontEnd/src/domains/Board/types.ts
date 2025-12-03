// Board 도메인 타입 정의

/**
 * 게시판 타입
 */
export type BoardType = 'NEWS' | 'ACADEMIC' | 'COMMUNITY' | 'QNA' | 'FREE';

/**
 * 작성자 정보
 */
export interface BoardAuthor {
  id: number;
  userId?: string;
  nickname: string;
  email?: string;
}

/**
 * 게시글 정보
 */
export interface Board {
  id: number;
  title: string;
  content: string;
  boardType: BoardType;
  author: BoardAuthor;
  filename?: string | null;
  filepath?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 게시글 목록 조회 요청 파라미터
 */
export interface BoardListParams {
  boardType: BoardType;
  searchKeyword?: string;
  page?: number;
  size?: number;
  sort?: 'createdAt,desc' | 'createdAt,asc' | 'title,asc' | 'title,desc';
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
  boardType: BoardType;
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
  boardType: BoardType;
  title: string;
  content: string;
  file?: File;
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

