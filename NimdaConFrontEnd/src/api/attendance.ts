/**
 * 출석(Attendance) 관련 API 모음
 */

const API_BASE_URL = "/api/cite/attendance";

// --- [DTO/Type 정의] ---

export interface Attendance {
  userId: number;
  totalCount: number;
  consecutiveCount: number;
  lastDate: string | null;
}

export interface AttendanceLog {
  id: number;
  attendanceDate: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// --- [API 함수] ---

/**
 * [GET] 내 누적 출석 횟수 조회 (마이페이지 '방문' 수치용)
 * 백엔드 매칭: return ApiResponse.ok(Map.of("visitCount", dto))
 */
export const getMyTotalAttendanceCount = async (): Promise<number> => {
  try {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.warn("인증 토큰이 없습니다.");
      return 0;
    }

    const response = await fetch(`${API_BASE_URL}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      console.error(`API 호출 실패 (${response.status}):`, await response.text());
      return 0;
    }

    // 💡 [수정] 백엔드에서 "visitCount"라는 키로 데이터를 보내므로 타입을 일치시킵니다.
    const result: ApiResponse<{ visitCount: number }> = await response.json();

    if (result.success && result.data) {
      // 💡 [수정] result.data.visitCount를 리턴합니다.
      return result.data.visitCount || 0;
    }
    return 0;
  } catch (error) {
    console.error("누적 출석 횟수 조회 실패:", error);
    return 0;
  }
};

/**
 * [POST] 출석 체크 실행
 */
export const checkIn = async (): Promise<ApiResponse<string>> => {
  try {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      throw new Error("인증 토큰이 없습니다.");
    }

    const response = await fetch(`${API_BASE_URL}/checkIn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      console.error(`API 호출 실패 (${response.status}):`, await response.text());
      return {
        success: false,
        message: `출석 체크 실패 (${response.status})`,
        data: "",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("출석 체크 실패:", error);
    return {
      success: false,
      message: String(error),
      data: "",
    };
  }
};

/**
 * [GET] 내 출석부 상태 전체 조회
 */
export const getMyAttendance = async (): Promise<ApiResponse<Attendance>> => {
  try {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      throw new Error("인증 토큰이 없습니다.");
    }

    const response = await fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      console.error(`API 호출 실패 (${response.status}):`, await response.text());
      return {
        success: false,
        message: `출석부 조회 실패 (${response.status})`,
        data: {} as Attendance,
      };
    }

    return await response.json();
  } catch (error) {
    console.error("출석부 조회 실패:", error);
    return {
      success: false,
      message: String(error),
      data: {} as Attendance,
    };
  }
};