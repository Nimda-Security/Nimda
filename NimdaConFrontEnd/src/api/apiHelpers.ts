// 저지(judge) API 공통 헬퍼
// 백엔드 응답은 항상 { success, message, data } 로 래핑되고(ApiResponse),
// 목록은 data 안에 Spring Page 객체로 들어온다.

import { addVersionToHeaders } from '@/constants/version';

const API_BASE_URL = '/api';

export interface ApiEnvelope<T> {
  success: boolean;
  message: string | null;
  data: T | null;
}

export interface SpringPage<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // 0-기반 현재 페이지
  size: number;
  first: boolean;
  last: boolean;
}

export type ApiResult<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; status?: number };

/**
 * 버전 헤더 + 쿠키 인증을 일괄 적용하고 ApiResponse 래핑을 벗겨서 돌려준다.
 * 하우스 스타일에 따라 절대 throw 하지 않는다.
 */
export const judgeFetch = async <T>(
  path: string,
  init: RequestInit = {},
  errorLabel = '저지 API',
): Promise<ApiResult<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: addVersionToHeaders({
        'Content-Type': 'application/json',
        ...((init.headers as Record<string, string>) ?? {}),
      }),
      credentials: 'include',
    });

    const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

    if (response.ok && body && body.success !== false) {
      return { success: true, message: body.message ?? '', data: body.data as T };
    }

    return {
      success: false,
      status: response.status,
      message:
        body?.message ||
        (response.status === 401
          ? '로그인이 필요합니다.'
          : response.status === 403
            ? '권한이 없습니다.'
            : `요청에 실패했습니다. (${response.status})`),
    };
  } catch (error) {
    console.error(`${errorLabel} 오류:`, error);
    return {
      success: false,
      message: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
    };
  }
};
