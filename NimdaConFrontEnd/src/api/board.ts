// 게시판 관련 API 함수들

import type {
  Board,
  BoardType,
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
    const { boardType, searchKeyword, page = 0, size = 10, sort = 'createdAt,desc' } = params;

    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams({
      boardType,
      page: page.toString(),
      size: size.toString(),
      sort,
    });

    if (searchKeyword && searchKeyword.trim()) {
      queryParams.append('searchKeyword', searchKeyword.trim());
    }

    const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await parseJsonSafe(response);

    if (response.ok && result) {
      return {
        success: true,
        message: result.message || '게시글 목록을 성공적으로 조회했습니다.',
        posts: result.posts || [],
        totalElements: result.totalElements || 0,
        totalPages: result.totalPages || 0,
        currentPage: result.currentPage || 0,
        boardType: result.boardType || boardType,
      };
    }

    return {
      success: false,
      message: (result?.message as string) || '게시글 목록을 불러올 수 없습니다.',
      posts: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      boardType,
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
      boardType: params.boardType,
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
      return {
        success: true,
        message: result.message || '게시글을 성공적으로 조회했습니다.',
        board: result.board,
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

    const formData = new FormData();
    formData.append('boardType', data.boardType);
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.file) {
      formData.append('file', data.file);
    }

    console.log('[createBoardAPI] 요청 전송:', {
      url: API_BASE_URL,
      method: 'POST',
      hasToken: !!token,
      boardType: data.boardType,
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
      return {
        success: true,
        message: result.message || '게시글이 성공적으로 작성되었습니다.',
        board: result.board,
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
    formData.append('boardType', data.boardType);
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
      return {
        success: true,
        message: result.message || '게시글이 성공적으로 수정되었습니다.',
        board: result.board,
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
  
  // 상대 경로면 API 베이스 URL 추가
  const baseURL = import.meta.env.VITE_API_BASE_URL || '';
  return `${baseURL}${filepath}`;
};

