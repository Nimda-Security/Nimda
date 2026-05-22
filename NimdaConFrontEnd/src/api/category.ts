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
 * Note1-2. 쿠키 기반 인증 전환
 * 모든 인증은 HttpOnly 쿠키로 보내지므로 JS에서 토큰을 직접 다뤄 필요 없음
 * fetch는 같은 오리진 요청에 쿠키를 자동으로 포함하여 보냄
 */

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
      credentials: 'include',
    });

    if (response.ok) {
      const result = await parseJsonSafe(response);

      // { success: true, data: { ... } } 형식인 경우
      if (result && typeof result === 'object' && 'data' in result && result.data) {
        const category = result.data;
        if (typeof category === 'object' && 'id' in category && category.id != null) {
          return category as Category;
        }
      }

      // 직접 Category 객체가 오는 경우
      if (result && typeof result === 'object' && 'id' in result && result.id != null) {
        return result as Category;
      }

      console.error('카테고리 응답 형식이 올바르지 않습니다:', result);
      return null;
    }

    // 에러 응답 로깅
    if (response.status === 404) {
      console.warn(`카테고리를 찾을 수 없습니다: ${slug}`);
    } else {
      const errorText = await response.text();
      console.error(`카테고리 조회 실패 (${response.status}):`, errorText);
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
      credentials: 'include',
    });

    if (response.ok) {
      const result = await parseJsonSafe(response);
      // 백엔드 응답이 { success, data } 형식인 경우
      if (result && Array.isArray(result.data)) {
        return result.data;
      }
      // 직접 배열로 오는 경우
      if (Array.isArray(result)) {
        return result;
      }
      return [];
    }

    return [];
  } catch (error) {
    console.error('카테고리 목록 조회 API 오류:', error);
    return [];
  }
};

/**
 * 모든 카테고리 조회 (관리자용, isActive 무관)
 * - 관리자 권한 필요
 * - JWT 토큰 헤더에 포함
 * - 백엔드 응답: List<CategoryResponseDTO> 직접 반환 (배열)
 */
export const getAllCategoriesAdminAPI = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/all`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      const result = await parseJsonSafe(response);
      // 백엔드 응답이 { success, data } 형식인 경우
      if (result && Array.isArray(result.data)) {
        return result.data;
      }
      // 직접 배열로 오는 경우
      if (Array.isArray(result)) {
        return result;
      }
      console.error('카테고리 목록 형식이 올바르지 않습니다:', result);
      return [];
    }

    // 에러 응답 처리
    let errorMessage = '카테고리 목록을 불러오는데 실패했습니다.';
    if (response.status === 401) {
      errorMessage = '로그인이 필요합니다.';
    } else if (response.status === 403) {
      errorMessage = '관리자 권한이 필요합니다.';
    }

    const errorText = await response.text();
    console.error('카테고리 목록 조회 실패:', response.status, errorText);
    throw new Error(errorMessage);
  } catch (error) {
    console.error('관리자 카테고리 목록 조회 API 오류:', error);
    throw error; // 에러를 다시 throw하여 호출하는 쪽에서 처리할 수 있도록
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
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      const category = await parseJsonSafe(response);
      return {
        success: true,
        message: '카테고리가 성공적으로 생성되었습니다.',
        category: category as Category,
      };
    }

    return {
      success: false,
      message: result.message || '알 수 없는 오류가 발생했습니다.',
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
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
/**
 * 카테고리 순서 일괄 업데이트
 * - 관리자 권한 필요
 */
export const updateCategorySortOrderAPI = async (
  sortOrders: Array<{ id: number; sortOrder: number }>
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sort-order`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(sortOrders),
    });

    const result = await parseJsonSafe(response);
    if (response.ok) {
      return { success: true };
    }

    const errorMessage =
      result?.message ||
      (response.status === 401
        ? '로그인이 필요합니다.'
        : response.status === 403
          ? '관리자 권한이 필요합니다.'
          : '순서 저장에 실패했습니다.');

    return { success: false, message: errorMessage };
  } catch (error) {
    console.error('카테고리 순서 저장 API 오류:', error);
    return { success: false, message: '순서 저장 중 오류가 발생했습니다.' };
  }
};

export const deleteCategoryAPI = async (
  id: number
): Promise<CategoryDeleteResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
