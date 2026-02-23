// 카테고리 관련 API 함수들

import type { Category } from '@/domains/Board/types';

const API_BASE_URL = '/api/cite/category';

/**
 * Note0. parseJsonSafe
 * feat. JSON 응답 파싱 
 */
const parseJsonSafe = async (response: Response) => {
  try {
    const text = await response.text(); // 응답 본문을 문자열로 읽는다. 
    if (!text) return null;
    return JSON.parse(text);// 문자열을 객체로 변환하여, 파싱된 객체를 반환한다. 
  }
  catch {
    return null;
  }
};

/**
 * Note1. getAuthToken
 * feat. LocalStorage에서 JWT Token 추출
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Note2. getAuthHeaders 
 * Authorization 헤더 생성
 *  case1: Token이 있는 경우 'Content-Type', 'Authorization' Header extrat
 *  case2: Token이 없는 경우 'Content-Type' extract 
 */
const getAuthHeaders = (): Record<string, string> => {

  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Slug로 카테고리 조회
 * - 백엔드 응답: CategoryResponseDTO 직접 반환
 */
export const getCategoryBySlugAPI = async (slug: string): Promise<Category | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/slug/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const category = await parseJsonSafe(response);
      return category as Category;
    }

    return null;
  } catch (error) {
    console.error('카테고리 조회 API 오류:', error);
    return null;
  }
};

/**
 * 활성화된 모든 카테고리 조회
 * - 백엔드 응답: List<CategoryResponseDTO> 직접 반환 (배열)
 */
export const getAllCategoriesAPI = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const categories = await parseJsonSafe(response);
      return Array.isArray(categories) ? categories : [];
    }

    return [];
  } catch (error) {
    console.error('카테고리 목록 조회 API 오류:', error);
    return [];
  }
};

/**
 * 카테고리 생성 요청 DTO
 */
export interface CategoryCreateRequest {
  name: string;
  slug: string;
  parentId?: number | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

/**
 * 카테고리 수정 요청 DTO
 */
export interface CategoryUpdateRequest {
  name?: string | null;
  slug?: string | null;
  parentId?: number | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

/**
 * 카테고리 생성/수정 응답
 */
export interface CategoryResponse {
  success: boolean;
  message?: string;
  category?: Category;
}

/**
 * 카테고리 삭제 응답
 */
export interface CategoryDeleteResponse {
  success: boolean;
  message?: string;
}

/**
 * 카테고리 생성 API
 * - 관리자 권한 필요
 * - JWT 토큰 헤더에 포함
 * 
 * @param data 카테고리 생성 데이터
 * @returns 생성된 카테고리 정보
 */
export const createCategoryAPI = async (
  data: CategoryCreateRequest
): Promise<CategoryResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const category = await parseJsonSafe(response);
      return {
        success: true,
        message: '카테고리가 성공적으로 생성되었습니다.',
        category: category as Category,
      };
    }

    // 에러 응답 처리
    let errorMessage = '카테고리 생성에 실패했습니다.';
    if (response.status === 401) {
      errorMessage = '로그인이 필요합니다.';
    } else if (response.status === 403) {
      errorMessage = '관리자 권한이 필요합니다.';
    } else if (response.status === 400) {
      errorMessage = '입력한 정보를 확인해주세요.';
    }

    return {
      success: false,
      message: errorMessage,
    };
  } catch (error) {
    console.error('카테고리 생성 API 오류:', error);
    return {
      success: false,
      message: '카테고리 생성 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 카테고리 수정 API
 * - 관리자 권한 필요
 * - JWT 토큰 헤더에 포함
 * 
 * @param id 카테고리 ID
 * @param data 카테고리 수정 데이터
 * @returns 수정된 카테고리 정보
 */
export const updateCategoryAPI = async (
  id: number,
  data: CategoryUpdateRequest
): Promise<CategoryResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const category = await parseJsonSafe(response);
      return {
        success: true,
        message: '카테고리가 성공적으로 수정되었습니다.',
        category: category as Category,
      };
    }

    // 에러 응답 처리
    let errorMessage = '카테고리 수정에 실패했습니다.';
    if (response.status === 401) {
      errorMessage = '로그인이 필요합니다.';
    } else if (response.status === 403) {
      errorMessage = '관리자 권한이 필요합니다.';
    } else if (response.status === 400) {
      errorMessage = '입력한 정보를 확인해주세요.';
    } else if (response.status === 404) {
      errorMessage = '카테고리를 찾을 수 없습니다.';
    }

    return {
      success: false,
      message: errorMessage,
    };
  } catch (error) {
    console.error('카테고리 수정 API 오류:', error);
    return {
      success: false,
      message: '카테고리 수정 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 카테고리 삭제 API
 * - 관리자 권한 필요
 * - JWT 토큰 헤더에 포함
 * - 소프트 삭제 (isActive = false)
 * 
 * @param id 카테고리 ID
 * @returns 삭제 결과
 */
export const deleteCategoryAPI = async (
  id: number
): Promise<CategoryDeleteResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      return {
        success: true,
        message: '카테고리가 성공적으로 삭제되었습니다.',
      };
    }

    // 에러 응답 처리
    let errorMessage = '카테고리 삭제에 실패했습니다.';
    if (response.status === 401) {
      errorMessage = '로그인이 필요합니다.';
    } else if (response.status === 403) {
      errorMessage = '관리자 권한이 필요합니다.';
    } else if (response.status === 400) {
      errorMessage = '카테고리를 삭제할 수 없습니다. (하위 카테고리나 게시글이 존재할 수 있습니다)';
    } else if (response.status === 404) {
      errorMessage = '카테고리를 찾을 수 없습니다.';
    }

    return {
      success: false,
      message: errorMessage,
    };
  } catch (error) {
    console.error('카테고리 삭제 API 오류:', error);
    return {
      success: false,
      message: '카테고리 삭제 중 오류가 발생했습니다.',
    };
  }
};
