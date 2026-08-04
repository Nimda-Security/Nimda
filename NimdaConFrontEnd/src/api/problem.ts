// 문제 관련 API
// 실제 백엔드 경로: /api/judge/problem (judgeServer.domain.problem.ProblemController)

import { addVersionToHeaders } from '@/constants/version';
import { judgeFetch } from './apiHelpers';
import type { ApiResult, SpringPage } from './apiHelpers';

const API_BASE_URL = '/api';

export interface ProblemSummary {
  id: number;
  title: string;
  points: number;
  createdAt: string | number; // 백엔드가 Google DateTime으로 직렬화 — 형식이 다른 DTO와 다름
  code: string;
}

export interface ProblemDetail {
  title: string;
  description: string;
  timeLimit: number;
  // TODO(backend bug): ViewProblemDetailsResponse가 memoryLimit에 timeLimit 값을 넣고 있음.
  // 클라이언트에서 보정하지 않고 그대로 표시한다. 백엔드 수정 시 자동 정상화.
  memoryLimit: number;
  points: number;
  createdAt: string;
}

/** 문제 목록 (Spring Pageable, page는 0-기반) */
export const getProblemsAPI = (page = 0, size = 20): Promise<ApiResult<SpringPage<ProblemSummary>>> =>
  judgeFetch<SpringPage<ProblemSummary>>(
    `/judge/problem?page=${page}&size=${size}&sort=createdAt,DESC`,
    {},
    '문제 목록 조회 API',
  );

/** 문제 상세 */
export const getProblemDetailAPI = (id: number | string): Promise<ApiResult<ProblemDetail>> =>
  judgeFetch<ProblemDetail>(`/judge/problem/${id}`, {}, '문제 조회 API');

/** 문제 지문 HTML — 유일하게 ApiResponse로 래핑되지 않는 raw text/html 응답 */
export const getProblemHtmlAPI = async (
  id: number | string,
): Promise<{ success: boolean; html?: string; message?: string; status?: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/judge/problem/${id}/html`, {
      method: 'GET',
      headers: addVersionToHeaders(),
      credentials: 'include',
    });

    if (response.ok) {
      return { success: true, html: await response.text() };
    }
    return {
      success: false,
      status: response.status,
      message:
        response.status === 401 ? '로그인이 필요합니다.' : '문제 지문을 불러올 수 없습니다.',
    };
  } catch (error) {
    console.error('문제 지문 조회 API 오류:', error);
    return { success: false, message: '문제 지문을 불러올 수 없습니다.' };
  }
};

/* ------------------------------------------------------------------ */
/* LEGACY — 아래 함수들은 존재하지 않는 엔드포인트(/api/problems*)를 호출한다.  */
/* ProblemCreate/ProblemEdit 관리자 페이지가 재작성될 때까지 컴파일용으로만 유지.  */
/* 실제 문제 등록은 POST /api/judge/problem (multipart, ADMIN) — 별도 작업 필요. */
/* ------------------------------------------------------------------ */

const parseJsonSafe = async (response: Response): Promise<Record<string, unknown> | null> => {
  try {
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const legacyMessage = (result: Record<string, unknown> | null, fallback: string, status: number) =>
  (result && typeof result.message === 'string' && result.message) ||
  (status === 403 ? '권한이 없습니다. 관리자 계정으로 로그인하세요.' : fallback);

/** @deprecated 죽은 엔드포인트 — /api/problems는 백엔드에 없음 */
export const createProblemAPI = async (problemData: Record<string, unknown>) => {
  try {
    const response = await fetch(`${API_BASE_URL}/problems`, {
      method: 'POST',
      headers: addVersionToHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(problemData),
    });
    const result = await parseJsonSafe(response);
    if (response.ok) {
      return {
        success: true,
        message: (result?.message as string) || '문제가 성공적으로 출제되었습니다.',
        problem: result?.problem,
      };
    }
    return {
      success: false,
      status: response.status,
      message: legacyMessage(result, '문제 출제에 실패했습니다.', response.status),
    };
  } catch (error) {
    console.error('문제 출제 API 오류:', error);
    return { success: false, message: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.' };
  }
};

/** @deprecated 죽은 엔드포인트 — /api/problems/{id}/admin은 백엔드에 없음 */
export const getProblemByIdForAdminAPI = async (id: number | string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/problems/${id}/admin`, {
      method: 'GET',
      headers: addVersionToHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
    });
    const result = await parseJsonSafe(response);
    if (response.ok) return result ?? { success: true };
    return {
      success: false,
      status: response.status,
      message: legacyMessage(result, '문제를 불러올 수 없습니다.', response.status),
    };
  } catch (error) {
    console.error('문제 조회 API 오류:', error);
    return { success: false, message: '문제를 불러올 수 없습니다.' };
  }
};

/** @deprecated 죽은 엔드포인트 — PUT /api/problems/{id}는 백엔드에 없음 (수정 API 자체가 없음) */
export const updateProblemAPI = async (id: number | string, problemData: Record<string, unknown>) => {
  try {
    const response = await fetch(`${API_BASE_URL}/problems/${id}`, {
      method: 'PUT',
      headers: addVersionToHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(problemData),
    });
    const result = await parseJsonSafe(response);
    if (response.ok) {
      return {
        success: true,
        message: (result?.message as string) || '문제가 성공적으로 수정되었습니다.',
        problem: result?.problem,
      };
    }
    return {
      success: false,
      status: response.status,
      message: legacyMessage(result, '문제 수정에 실패했습니다.', response.status),
    };
  } catch (error) {
    console.error('문제 수정 API 오류:', error);
    return { success: false, message: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.' };
  }
};
