// 댓글 관련 API 함수들

import type {
  CommentCreateRequest,
  CommentUpdateRequest,
  CommentStatusUpdateRequest,
  CommentUserResponse,
  CommentAdminResponse,
} from '@/domains/Comment/types'; // 타입 파일 경로에 맞게 수정

const API_BASE_URL = '/api';

/**
 * JSON 응답 파싱 (안전)
 */
const parseJsonSafe = async (response: Response) => {
  try {
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
};

/**
 * 토큰 조회
 * ⚠️ localStorage는 XSS에 취약합니다.
 * 가능하다면 httpOnly 쿠키 기반 인증으로 전환을 권장합니다.
 */
const getToken = (): string | null => localStorage.getItem('authToken');

// =============== 응답 타입 ===============

export interface CommentErrorResponse {
  success: false;
  message: string;
}

export interface CommentListResponse {
  success: true;
  message: string;
  comments: CommentUserResponse[] | CommentAdminResponse[];
}

export interface CommentSingleResponse {
  success: true;
  message: string;
  comment: CommentUserResponse;
}

export interface CommentAdminSingleResponse {
  success: true;
  message: string;
  comment: CommentAdminResponse;
}

export interface CommentDeleteResponse {
  success: true;
  message: string;
}

// =============== 타입 가드 ===============

/**
 * 어드민 댓글 목록 여부 확인
 * 빈 배열의 경우 타입을 판별할 수 없으므로 false 반환
 */
export const isAdminComments = (
  comments: CommentUserResponse[] | CommentAdminResponse[]
): comments is CommentAdminResponse[] => {
  if (comments.length === 0) return false;
  return 'authorId' in comments[0];
};

// =============== API 함수 ===============

/**
 * 특정 게시글 댓글 생성 API
 * POST /api/board/{boardId}/comments
 *
 * @param boardId 게시글 ID
 * @param data 댓글 작성 데이터
 * @returns 작성된 댓글 응답
 */
export const createCommentAPI = async (
  boardId: number,
  data: CommentCreateRequest
): Promise<CommentSingleResponse | CommentErrorResponse> => {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    const response = await fetch(`${API_BASE_URL}/board/${boardId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await parseJsonSafe(response);

    if (response.ok && result?.success) {
      const resData = result.data || result;
      const comment = resData.comment ?? result.comment;
      if (!comment) {
        return { success: false, message: '댓글 데이터를 받지 못했습니다.' };
      }
      return {
        success: true,
        message: result.message || '댓글이 성공적으로 작성되었습니다.',
        comment,
      };
    }

    return {
      success: false,
      message: (result?.message as string) || '댓글 작성에 실패했습니다.',
    };
  } catch (error) {
    console.error('댓글 작성 API 오류:', error);
    return { success: false, message: '댓글 작성 중 오류가 발생했습니다.' };
  }
};

/**
 * 특정 게시글 댓글 목록 조회 API
 * GET /api/board/{boardId}/comments
 * - 어드민: CommentAdminResponse[] 반환
 * - 일반 유저: CommentUserResponse[] 반환
 *
 * 반환된 배열이 어드민용인지 확인하려면 isAdminComments() 타입 가드를 사용하세요.
 * 단, 빈 배열일 경우 판별 불가 (isAdminComments → false)이므로
 * 어드민 여부를 별도 상태(예: useAuthStore)로 관리하는 것을 권장합니다.
 *
 * @param boardId 게시글 ID
 * @returns 댓글 목록 응답
 */
export const getCommentsAPI = async (
  boardId: number
): Promise<CommentListResponse | CommentErrorResponse> => {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    const response = await fetch(`${API_BASE_URL}/board/${boardId}/comments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await parseJsonSafe(response);

    if (response.ok && result?.success) {
      const resData = result.data || result;
      return {
        success: true,
        message: result.message || '댓글을 성공적으로 조회했습니다.',
        comments: resData.comments ?? [],
      };
    }

    return {
      success: false,
      message: (result?.message as string) || '댓글 목록을 불러올 수 없습니다.',
    };
  } catch (error) {
    console.error('댓글 목록 조회 API 오류:', error);
    return { success: false, message: '댓글 목록을 불러올 수 없습니다.' };
  }
};

/**
 * 댓글 수정 API
 * PATCH /api/comments/{commentId}
 *
 * @param commentId 댓글 ID
 * @param data 수정할 댓글 내용
 * @returns 수정된 댓글 응답
 */
export const updateCommentAPI = async (
  commentId: number,
  data: CommentUpdateRequest
): Promise<CommentSingleResponse | CommentErrorResponse> => {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await parseJsonSafe(response);

    if (response.ok && result?.success) {
      const resData = result.data || result;
      const comment = resData.comment ?? result.comment;
      if (!comment) {
        return { success: false, message: '수정된 댓글 데이터를 받지 못했습니다.' };
      }
      return {
        success: true,
        message: result.message || '댓글을 성공적으로 수정했습니다.',
        comment,
      };
    }

    return {
      success: false,
      message: (result?.message as string) || '댓글 수정에 실패했습니다.',
    };
  } catch (error) {
    console.error('댓글 수정 API 오류:', error);
    return { success: false, message: '댓글 수정 중 오류가 발생했습니다.' };
  }
};

/**
 * 댓글 상태 변경 API (어드민 전용)
 * PATCH /api/comments/{commentId}/status
 *
 * @param commentId 댓글 ID
 * @param data 변경할 댓글 상태
 * @returns 상태가 변경된 댓글 응답
 */
export const updateCommentStatusAPI = async (
  commentId: number,
  data: CommentStatusUpdateRequest
): Promise<CommentAdminSingleResponse | CommentErrorResponse> => {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await parseJsonSafe(response);

    if (response.ok && result?.success) {
      const resData = result.data || result;
      const comment = resData.comment ?? result.comment;
      if (!comment) {
        return { success: false, message: '변경된 댓글 데이터를 받지 못했습니다.' };
      }
      return {
        success: true,
        message: result.message || '댓글 상태를 성공적으로 변경했습니다.',
        comment,
      };
    }

    return {
      success: false,
      message: (result?.message as string) || '댓글 상태 변경에 실패했습니다.',
    };
  } catch (error) {
    console.error('댓글 상태 변경 API 오류:', error);
    return { success: false, message: '댓글 상태 변경 중 오류가 발생했습니다.' };
  }
};

/**
 * 댓글 삭제 API (소프트 삭제)
 * DELETE /api/comments/{commentId}
 *
 * @param commentId 댓글 ID
 * @returns 댓글 삭제 응답
 */
export const deleteCommentAPI = async (
  commentId: number
): Promise<CommentDeleteResponse | CommentErrorResponse> => {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await parseJsonSafe(response);

    if (response.ok && result?.success) {
      return {
        success: true,
        message: result.message || '댓글이 성공적으로 삭제되었습니다.',
      };
    }

    return {
      success: false,
      message: (result?.message as string) || '댓글 삭제에 실패했습니다.',
    };
  } catch (error) {
    console.error('댓글 삭제 API 오류:', error);
    return { success: false, message: '댓글 삭제 중 오류가 발생했습니다.' };
  }
};