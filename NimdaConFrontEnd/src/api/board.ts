// 게시판 관련 API 함수들

import type {
  Category,
  BoardListParams,
  BoardListResponse,
  BoardDetailResponse,
  BoardWriteRequest,
  BoardWriteResponse,
  BoardDeleteResponse,
  BoardErrorResponse,
} from '@/domains/Board/types';

const API_BASE_URL = '/api/cite/board';

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
 * 게시글 목록 조회 API
 * 
 * @param params 게시글 목록 조회 파라미터
 * @returns 게시글 목록 응답
 */
export const getBoardListAPI = async (
  params: BoardListParams
): Promise<BoardListResponse> => {
  try {
    const { categoryId, slug, searchKeyword, page = 0, size = 10, sort = 'createdAt,desc', includeChildren } = params;

    if (!categoryId && !slug) {
      return {
        success: false,
        message: 'categoryId 또는 slug 파라미터가 필요합니다.',
        posts: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        category: {} as Category,
      };
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort,
    });

    if (categoryId) {
      queryParams.append('categoryId', categoryId.toString());
    }
    if (slug) {
      queryParams.append('slug', slug);
    }
    if (searchKeyword && searchKeyword.trim()) {
      queryParams.append('searchKeyword', searchKeyword.trim());
    }
    if (includeChildren) {
      queryParams.append('includeChildren', 'true');
    }

    const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await parseJsonSafe(response);

    if (response.ok && result) {
      // 백엔드 응답이 { success, data: { posts, category, ... } } 형식인 경우
      const data = result.data || result;
      return {
        success: true,
        message: result.message || '게시글 목록을 성공적으로 조회했습니다.',
        posts: data.posts || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.currentPage || 0,
        category: data.category || ({} as Category),
      };
    }

    return {
      success: false,
      message: (result?.message as string) || '게시글 목록을 불러올 수 없습니다.',
      posts: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      category: {} as Category,
    };
  } catch (error) {
    console.error('게시글 목록 조회 API 오류:', error);
    return {
      success: false,
      message: '게시글 목록을 불러올 수 없습니다.',
      posts: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      category: {} as Category,
    };
  }
};

/**
 * 게시글 상세 조회 API
 * 
 * @param id 게시글 ID
 * @returns 게시글 상세 응답
 */
export const getBoardDetailAPI = async (
  id: number
): Promise<BoardDetailResponse | BoardErrorResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await parseJsonSafe(response);

    if (response.ok && result?.success) {
      const data = result.data || result;
      return {
        success: true,
        message: result.message || '게시글을 성공적으로 조회했습니다.',
        board: data.board || result.board,
      };
    }

    return {
      success: false,
      message: (result?.message as string) || '게시글을 찾을 수 없습니다.',
    };
  } catch (error) {
    console.error('게시글 상세 조회 API 오류:', error);
    return {
      success: false,
      message: '게시글을 불러올 수 없습니다.',
    };
  }
};

/**
 * 게시글 작성 API
 * 
 * @param data 게시글 작성 데이터
 * @returns 게시글 작성 응답
 */
export const createBoardAPI = async (
  data: BoardWriteRequest
): Promise<BoardWriteResponse | BoardErrorResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    console.log('[createBoardAPI] 토큰 확인:', token ? `존재함 (길이: ${token.length})` : '없음');

    if (!token) {
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    // categoryId 유효성 검사
    if (!data.categoryId || typeof data.categoryId !== 'number') {
      console.error('[createBoardAPI] 유효하지 않은 categoryId:', data.categoryId);
      return {
        success: false,
        message: '카테고리 ID가 유효하지 않습니다.',
      };
    }

    const formData = new FormData();
    formData.append('categoryId', data.categoryId.toString());
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.file) {
      formData.append('file', data.file);
    }

    console.log('[createBoardAPI] 요청 전송:', {
      url: API_BASE_URL,
      method: 'POST',
      hasToken: !!token,
      categoryId: data.categoryId,
      title: data.title,
    });

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // FormData 사용 시 Content-Type은 브라우저가 자동으로 설정
      },
      body: formData,
    });

    console.log('[createBoardAPI] 응답 상태:', response.status, response.statusText);

    const result = await parseJsonSafe(response);

    if (response.ok && result?.success) {
      const data = result.data || result;
      return {
        success: true,
        message: result.message || '게시글이 성공적으로 작성되었습니다.',
        board: data.board || result.board,
      };
    }

    return {
      success: false,
      message: (result?.message as string) || '게시글 작성에 실패했습니다.',
    };
  } catch (error) {
    console.error('게시글 작성 API 오류:', error);
    return {
      success: false,
      message: '게시글 작성 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 게시글 수정 API
 * 
 * @param id 게시글 ID
 * @param data 게시글 수정 데이터
 * @returns 게시글 수정 응답
 */
export const updateBoardAPI = async (
  id: number,
  data: BoardWriteRequest
): Promise<BoardWriteResponse | BoardErrorResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    const formData = new FormData();
    formData.append('categoryId', data.categoryId.toString());
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await parseJsonSafe(response);

    if (response.ok && result?.success) {
      const data = result.data || result;
      return {
        success: true,
        message: result.message || '게시글이 성공적으로 수정되었습니다.',
        board: data.board || result.board,
      };
    }

    return {
      success: false,
      message: (result?.message as string) || '게시글 수정에 실패했습니다.',
    };
  } catch (error) {
    console.error('게시글 수정 API 오류:', error);
    return {
      success: false,
      message: '게시글 수정 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 게시글 삭제 API
 * 
 * @param id 게시글 ID
 * @returns 게시글 삭제 응답
 */
export const deleteBoardAPI = async (
  id: number
): Promise<BoardDeleteResponse | BoardErrorResponse> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await parseJsonSafe(response);

    if (response.ok && result?.success) {
      return {
        success: true,
        message: result.message || '게시글이 성공적으로 삭제되었습니다.',
      };
    }

    return {
      success: false,
      message: (result?.message as string) || '게시글 삭제에 실패했습니다.',
    };
  } catch (error) {
    console.error('게시글 삭제 API 오류:', error);
    return {
      success: false,
      message: '게시글 삭제 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 고정글 목록 조회 API (메인 페이지 공지사항 섹션용)
 */
export const getPinnedPostsAPI = async (
  categoryId?: number,
  slug?: string,
  size: number = 4
): Promise<BoardListResponse> => {
  try {
    if (!categoryId && !slug) {
      return {
        success: false,
        message: 'categoryId 또는 slug 파라미터가 필요합니다.',
        posts: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        category: {} as Category,
      };
    }

    const queryParams = new URLSearchParams({
      page: '0',
      size: size.toString(),
    });

    if (categoryId) {
      queryParams.append('categoryId', categoryId.toString());
    }
    if (slug) {
      queryParams.append('slug', slug);
    }

    const response = await fetch(`${API_BASE_URL}/pinned?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await parseJsonSafe(response);

    if (response.ok && result) {
      const data = result.data || result;
      return {
        success: true,
        message: result.message || '고정글 목록을 성공적으로 조회했습니다.',
        posts: data.posts || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        currentPage: 0,
        category: data.category || ({} as Category),
      };
    }

    return {
      success: false,
      message: (result?.message as string) || '고정글 목록을 불러올 수 없습니다.',
      posts: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      category: {} as Category,
    };
  } catch (error) {
    console.error('고정글 목록 조회 API 오류:', error);
    return {
      success: false,
      message: '고정글 목록을 불러올 수 없습니다.',
      posts: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      category: {} as Category,
    };
  }
};

/**
 * 인기글 목록 조회 API (메인 페이지 인기글 섹션용)
 */
export const getPopularPostsAPI = async (
  categoryId?: number,
  slug?: string,
  size: number = 10
): Promise<BoardListResponse> => {
  try {
    const queryParams = new URLSearchParams({
      page: '0',
      size: size.toString(),
    });

    if (categoryId) {
      queryParams.append('categoryId', categoryId.toString());
    }
    if (slug) {
      queryParams.append('slug', slug);
    }

    const response = await fetch(`${API_BASE_URL}/popular?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await parseJsonSafe(response);

    if (response.ok && result) {
      const data = result.data || result;
      return {
        success: true,
        message: result.message || '인기글 목록을 성공적으로 조회했습니다.',
        posts: data.posts || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        currentPage: 0,
        category: data.category || ({} as Category),
      };
    }

    return {
      success: false,
      message: (result?.message as string) || '인기글 목록을 불러올 수 없습니다.',
      posts: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      category: {} as Category,
    };
  } catch (error) {
    console.error('인기글 목록 조회 API 오류:', error);
    return {
      success: false,
      message: '인기글 목록을 불러올 수 없습니다.',
      posts: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      category: {} as Category,
    };
  }
};

/**
 * 파일 다운로드 URL 생성
 * 
 * @param filepath 파일 경로 (예: /api/download/filename.pdf)
 * @returns 전체 다운로드 URL
 */
export const getFileDownloadURL = (filepath: string | null | undefined): string | null => {
  if (!filepath) return null;

  // 이미 전체 URL이면 그대로 반환
  if (filepath.startsWith('http://') || filepath.startsWith('https://')) {
    return filepath;
  }

  // filepath가 /api/download/ 형식이면 그대로 사용
  // 파일명에 특수문자가 있을 수 있으므로 인코딩은 브라우저가 자동 처리
  return filepath;
};

/**
 * 좋아요 상태 조회 응답
 */
export interface BoardLikeStatusResponse {
  success: boolean;
  message: string;
  data: {
    likeCount: number;
    isLiked: boolean;
  };
}

/**
 * 좋아요 토글 응답
 */
export interface BoardLikeToggleResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    likeCount: number;
    isLiked: boolean;
  };
}

const LIKE_API_BASE_URL = '/api/like/board';

/**
 * 게시글 좋아요 상태 조회 API
 * 
 * @param boardId 게시글 ID
 * @returns 좋아요 상태 (개수, 사용자 좋아요 여부)
 */
export const getBoardLikeStatusAPI = async (
  boardId: number
): Promise<BoardLikeStatusResponse | BoardErrorResponse> => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    const response = await fetch(`${LIKE_API_BASE_URL}/${boardId}/likeStatus`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await parseJsonSafe(response);

    if (response.ok && result?.success) {
      return {
        success: true,
        message: result.message || '좋아요 상태를 조회했습니다.',
        data: result.data || result,
      };
    }

    return {
      success: false,
      message: (result?.message as string) || '좋아요 상태 조회에 실패했습니다.',
    };
  } catch (error) {
    console.error('좋아요 상태 조회 API 오류:', error);
    return {
      success: false,
      message: '좋아요 상태를 불러올 수 없습니다.',
    };
  }
};

/**
 * 게시글 좋아요 토글 API
 * 
 * @param boardId 게시글 ID
 * @returns 좋아요 토글 결과 (메시지, 개수, 사용자 좋아요 여부)
 */
export const toggleBoardLikeAPI = async (
  boardId: number
): Promise<BoardLikeToggleResponse | BoardErrorResponse> => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    const response = await fetch(`${LIKE_API_BASE_URL}/${boardId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await parseJsonSafe(response);

    if (response.ok && result?.success) {
      return {
        success: true,
        message: result.message || '좋아요가 처리되었습니다.',
        data: result.data || result,
      };
    }

    return {
      success: false,
      message: (result?.message as string) || '좋아요 처리에 실패했습니다.',
    };
  } catch (error) {
    console.error('좋아요 토글 API 오류:', error);
    return {
      success: false,
      message: '좋아요를 처리할 수 없습니다.',
    };
  }
};
