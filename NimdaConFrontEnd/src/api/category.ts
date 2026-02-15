// 카테고리 관련 API 함수들

import type { Category } from '@/domains/Board/types';

const API_BASE_URL = '/api/cite/category';

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
 * Slug로 카테고리 조회
 */
export const getCategoryBySlugAPI = async (slug: string): Promise<Category | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/slug/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await parseJsonSafe(response);

    if (response.ok && result?.success) {
      return result.category;
    }

    return null;
  } catch (error) {
    console.error('카테고리 조회 API 오류:', error);
    return null;
  }
};

/**
 * 활성화된 모든 카테고리 조회
 */
export const getAllCategoriesAPI = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await parseJsonSafe(response);

    if (response.ok && result?.success) {
      return result.categories || [];
    }

    return [];
  } catch (error) {
    console.error('카테고리 목록 조회 API 오류:', error);
    return [];
  }
};
