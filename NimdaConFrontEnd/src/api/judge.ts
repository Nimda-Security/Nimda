// 채점 관련 API 함수들

const API_BASE_URL = "/api";

export interface SubmissionRequest {
  title: string;
  code: string;
  language: string;
  problemId?: number; // 문제 ID 추가
  description?: string;
  flag?: string;
  hints?: string;
  points?: number;
}

export interface JudgeResponse {
  success: boolean;
  message: string;
  result?: {
    status: string;
    message?: string;
    output?: string;
    errorOutput?: string;
    executionTime?: number;
    memoryUsage?: number;
    score?: number;
  };
  submittedBy?: string;
  submissionId?: number;
}

/**
 * 코드 제출 및 채점 API 호출
 */
export const submitCodeAPI = async (
  submissionData: SubmissionRequest
): Promise<JudgeResponse> => {
  try {
    // localStorage에서 토큰 가져오기
    const token = localStorage.getItem("authToken");

    // 헤더 구성
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // 토큰이 있으면 Authorization 헤더 추가
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/judge/submit`, {
      method: "POST",
      headers,
      body: JSON.stringify(submissionData),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message || "채점이 완료되었습니다.",
        result: result.result,
        submittedBy: result.submittedBy,
        submissionId: result.submissionId,
      };
    } else {
      return {
        success: false,
        message: result.message || "채점에 실패했습니다.",
      };
    }
  } catch (error) {
    console.error("채점 API 오류:", error);
    return {
      success: false,
      message: "채점 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
    };
  }
};

/**
 * 지원하는 언어 목록 조회
 */
export const getSupportedLanguagesAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/judge/languages`);
    return await response.json();
  } catch (error) {
    console.error("언어 목록 조회 오류:", error);
    return { success: false, message: "언어 목록을 가져올 수 없습니다." };
  }
};

/**
 * 모든 제출 목록 조회 API
 * backend API 주소 : api/judge/submissions
 */
export const getAllSubmissionsAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/judge/submissions`);
    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        submissions: result.submissions || [],
        totalCount: result.totalCount || 0,
        message: result.message,
      };
    } else {
      return {
        success: false,
        message: result.message || "제출 목록을 가져올 수 없습니다.",
      };
    }
  } catch (error) {
    console.error("제출 목록 조회 오류:", error);
    return {
      success: false,
      message: "서버에 연결할 수 없습니다.",
      submissions: [],
      totalCount: 0,
    };
  }
};
