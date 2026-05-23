// 태그 관련 API 함수들 (Tag 엔티티 기반)

import { addVersionToHeaders } from '../constants/version';

export interface TagResponse {
  id: number;
  tagName: string;
  sortValue: number;
  categoryName: string;
  categoryId: number;
}

export interface TagRequest {
  name: string;
  categoryId: number;
  sortValue?: number;
}

const API_BASE_URL = '/api/cite/tag';

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
 * 모든 태그 조회 (sortValue 기준 정렬)
 */
export const getAllTagsAPI = async (): Promise<TagResponse[]> => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: addVersionToHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
    });

    if (response.ok) {
      const result = await parseJsonSafe(response);
      if (result && Array.isArray(result.data)) return result.data;
      if (Array.isArray(result)) return result;
      return [];
    }
    return [];
  } catch (error) {
    console.error('전체 태그 조회 API 오류:', error);
    return [];
  }
};

/**
 * 카테고리별 태그 조회
 */
export const getTagsByCategoryAPI = async (categoryId: number): Promise<TagResponse[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${categoryId}`, {
      method: 'GET',
      headers: addVersionToHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
    });

    if (response.ok) {
      const result = await parseJsonSafe(response);
      if (result && Array.isArray(result.data)) return result.data;
      if (Array.isArray(result)) return result;
      return [];
    }
    return [];
  } catch (error) {
    console.error('카테고리별 태그 조회 API 오류:', error);
    return [];
  }
};

/**
 * 태그 추가
 */
export const addTagAPI = async (data: TagRequest): Promise<{ success: boolean; tag?: TagResponse; message?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/add-tag`, {
      method: 'POST',
      headers: addVersionToHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await parseJsonSafe(response);
      const tag = result?.data || result;
      return { success: true, tag };
    }

    const errorResult = await parseJsonSafe(response);
    return { success: false, message: errorResult?.message || '태그 추가에 실패했습니다.' };
  } catch (error) {
    console.error('태그 추가 API 오류:', error);
    return { success: false, message: '태그 추가 중 오류가 발생했습니다.' };
  }
};

/**
 * 태그 삭제
 */
export const deleteTagAPI = async (tagId: number): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${tagId}`, {
      method: 'DELETE',
      headers: addVersionToHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
    });

    if (response.ok) {
      return { success: true };
    }

    const errorResult = await parseJsonSafe(response);
    return { success: false, message: errorResult?.message || '태그 삭제에 실패했습니다.' };
  } catch (error) {
    console.error('태그 삭제 API 오류:', error);
    return { success: false, message: '태그 삭제 중 오류가 발생했습니다.' };
  }
};

/**
 * 태그 수정 (이름, 정렬값, 카테고리)
 */
export const updateTagAPI = async (
  tagId: number,
  data: Partial<TagRequest>
): Promise<{ success: boolean; tag?: TagResponse; message?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${tagId}`, {
      method: 'PATCH',
      headers: addVersionToHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await parseJsonSafe(response);
      const tag = result?.data || result;
      return { success: true, tag };
    }

    const errorResult = await parseJsonSafe(response);
    return { success: false, message: errorResult?.message || '태그 수정에 실패했습니다.' };
  } catch (error) {
    console.error('태그 수정 API 오류:', error);
    return { success: false, message: '태그 수정 중 오류가 발생했습니다.' };
  }
};
