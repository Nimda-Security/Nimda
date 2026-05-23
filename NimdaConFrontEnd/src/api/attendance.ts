/**
* 출석(Attendance) 관련 API 모듈
* 백엔드: com.nimda.cite.attendance.controller.AttendanceController 매칭
*/

import { addVersionToHeaders } from '../constants/version';

// --- [인터페이스 정의] ---

/** 오늘 방문자 정보 (TodayVisitorResponse DTO 매칭) */
export interface AttendanceLog {
    id: number;
userName: string;
profileImageUrl?: string;
profileDecoration?: string;
}

/** 출석부 상태 정보 (Attendance Entity 매칭) */
export interface Attendance {
userId: number;
totalCount: number;
consecutiveCount: number;
lastDate: string | null;
}

/** 출석 로그 상세 정보 (AttendanceLog Entity 매칭) */
export interface AttendanceDetailLog {
id: number;
attendanceDate: string;
}

/** 공통 API 응답 구조 */
export interface ApiResponse<T> {
success: boolean;
message: string;
data: T;
}

const API_BASE_URL = "/api/cite/attendance";

// --- [API 함수 모음] ---

/**
* 1. [POST] 출석 체크 실행
* @returns 성공 메시지 혹은 에러 응답
*/
export const checkIn = async (): Promise<ApiResponse<string>> => {
try {
const response = await fetch(`${API_BASE_URL}/checkIn`, {
method: "POST",
headers: addVersionToHeaders({
"Content-Type": "application/json",
}),
credentials: "include", // [중요] 쿠키 기반 인증을 위해 추가
body: JSON.stringify({}),
});

if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "출석 체크에 실패했습니다.",
        data: ""
      };
    }

    return await response.json();

  } catch (error) { // 여기서 에러가 났던 51번 라인입니다.
    console.error("출석 체크 실패:", error);
    return { success: false, message: "서버 통신 오류", data: "" };
  }
};

/**
 * 2. [GET] 오늘 출석자 전체 조회 (사이드바용)
 * 백엔드 TodayVisitorResponse 리스트 반환
 */
export const getTodayVisitors = async (): Promise<AttendanceLog[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/today`, {
      method: "GET",
      headers: addVersionToHeaders({
        "Content-Type": "application/json",
      }),
    });

    if (!response.ok) return [];

    const result: ApiResponse<AttendanceLog[]> = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error("오늘 방문자 조회 오류:", error);
    return [];
  }
};

/**
 * 3. [GET] 연속 출석 랭킹 TOP 5
 */
export const getConsecutiveRank = async (): Promise<Attendance[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rank/consecutive`, {
      method: "GET",
      headers: addVersionToHeaders({ "Content-Type": "application/json" }),
    });
    const result: ApiResponse<Attendance[]> = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error("연속 출석 랭킹 조회 실패:", error);
    return [];
  }
};

/**
 * 4. [GET] 누적 출석 랭킹 TOP 5
 */
export const getTotalRank = async (): Promise<Attendance[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rank/total`, {
      method: "GET",
      headers: addVersionToHeaders({ "Content-Type": "application/json" }),
    });
    const result: ApiResponse<Attendance[]> = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error("누적 출석 랭킹 조회 실패:", error);
    return [];
  }
};

/**
 * 5. [GET] 내 출석부 상태 조회 (연속/누적 횟수 등)
 */
export const getMyAttendance = async (): Promise<ApiResponse<Attendance>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      headers: addVersionToHeaders({
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });
    return await response.json();
  } catch (error) {
    console.error("내 출석 상태 조회 실패:", error);
    throw error;
  }
};

/**
 * 6. [GET] 내 상세 출석 로그 조회
 */
export const getMyLogs = async (): Promise<AttendanceDetailLog[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/me/logs`, {
      method: "GET",
      headers: addVersionToHeaders({
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });
    const result: ApiResponse<AttendanceDetailLog[]> = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error("내 출석 로그 조회 실패:", error);
    return [];
  }
};

/**
 * 7. [GET] 내 누적 출석 횟수 조회 (마이페이지 방문수 표시용)
 * 백엔드 반환 구조: { "visitCount": number }
 */
export const getMyTotalAttendanceCount = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "GET",
      headers: addVersionToHeaders({
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });

    if (!response.ok) return 0;

    const result: ApiResponse<{ visitCount: number }> = await response.json();
    return result.success ? result.data.visitCount : 0;
  } catch (error) {
    console.error("누적 출석 횟수 조회 실패:", error);
    return 0;
  }
};
