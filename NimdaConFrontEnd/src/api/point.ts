/**
 * 마일리지 관련 API 모듈
 * 경로: @/api/point.ts
 */

const API_BASE_URL = "/api/cite/point";

export interface PointHistoryItem {
  id?: number;
  description: string;
  amount: number;
  date: string;
  type?: "earn" | "use" | "expire";
}

export interface PointResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * 1. 사용자 마일리지 잔액 조회 (GET /api/cite/point)
 * 백엔드 BalanceResponse DTO: { totalAmount, updatedAt }
 */
export const getUserBalance = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return {
        success: true,
        currentBalance: result.data.totalAmount || 0,
      };
    }
    return { success: false, message: result.message || "잔액 조회 실패" };
  } catch (error) {
    console.error("잔액 조회 오류:", error);
    return { success: false, message: "서버 통신 중 오류가 발생했습니다." };
  }
};

/**
 * 2. 포인트 상세 내역 조회 (GET /api/cite/point/pointDetails)
 */
export const getPointDetailsAPI = async (): Promise<PointHistoryItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pointDetails`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`API 호출 실패 (${response.status}):`, await response.text());
      return [];
    }

    const result = await response.json();

    if (result.success && result.data && Array.isArray(result.data)) {
      if (result.data.length > 0) {
        return result.data.map((item: any) => ({
          id: item.id,
          description: item.description,
          amount: item.amount,
          date: item.createdAt ? item.createdAt.substring(5, 10).replace('-', '.') : "00.00",
          type: item.amount > 0 ? "earn" : (item.amount < 0 ? "use" : "expire"),
        }));
      }
      // 빈 배열 반환 (프로덕션 환경)
      return [];
    }
    return [];
  } catch (error) {
    console.error("상세 내역 조회 오류:", error);
    return [];
  }
};
/**
 * 3. [관리자용] 전체 유저 마일리지 잔액 조회 (GET /api/cite/point/allBalance)
 */
export const getAllBalance = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/allBalance`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return { success: true, data: result.data as { totalAmount: number; updatedAt: string }[] };
    }
    return { success: false, message: result.message || "전체 잔액 조회 실패" };
  } catch (error) {
    console.error("전체 잔액 조회 오류:", error);
    return { success: false, message: "서버 통신 중 오류가 발생했습니다." };
  }
};

/**
 * 4. [관리자용] 마일리지 수동 지급 (POST /api/cite/point)
 * studentNum: 지급 대상 학번
 */
export const updatePointManual = async (studentNum: string, description: string, amount: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        studentNum: studentNum,
        description: description,
        amount: amount
      }),
    });

    // 💡 [수정] 응답 본문이 비어있는지 확인 (204 No Content 또는 Content-Length가 0인 경우)
    const contentType = response.headers.get("content-type");
    let result: any = {};

    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      // JSON 응답이 없을 경우 텍스트로 시도하거나 빈 값 처리
      const text = await response.text();
      result = text ? { message: text } : {};
    }

    // 서버 응답 상태 확인
    if (response.ok) {
      return {
        success: true,
        message: result.message || "마일리지 지급이 완료되었습니다.",
        data: result.data || null
      };
    }

    return {
      success: false,
      message: result.message || `마일리지 지급 실패 (에러 코드: ${response.status})`
    };
  } catch (error) {
    console.error("수동 업데이트 오류:", error);
    return { success: false, message: "서버 통신 중 오류가 발생했습니다." };
  }
};

/**
 * 5. [관리자용] 마일리지 일괄 지급 (POST /api/cite/point/bulk)
 */
export const updatePointManualBulk = async (
  requests: { studentNum: string; description: string; amount: number }[]
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(requests),
    });

    const contentType = response.headers.get("content-type");
    let result: any = {};

    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      const text = await response.text();
      result = text ? { message: text } : {};
    }

    if (response.ok) {
      return {
        success: true,
        message: result.message || "마일리지 일괄 지급이 완료되었습니다.",
        data: result.data || null,
      };
    }

    return {
      success: false,
      message: result.message || `마일리지 일괄 지급 실패 (에러 코드: ${response.status})`,
    };
  } catch (error) {
    console.error("일괄 지급 오류:", error);
    return { success: false, message: "서버 통신 중 오류가 발생했습니다." };
  }
};