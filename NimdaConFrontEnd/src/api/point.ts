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
    const authToken = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
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
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.warn("인증 토큰이 없습니다.");
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/pointDetails`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
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
      return getMockPointData();
    }
    return [];
  } catch (error) {
    console.error("상세 내역 조회 오류:", error);
    return [];
  }
};

/**
 * 3. [관리자용] 마일리지 수동 지급 (POST /api/cite/point)
 * 백엔드 ManualBalanceUpdateRequest: { description, amount }
 */
export const updatePointManual = async (studentId: string, description: string, amount: number) => {
  try {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      return { success: false, message: "인증 토큰이 없습니다." };
    }

    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        studentId: studentId,      // 대상 학생
        description: description, // 지급 사유
        amount: amount             // 지급 금액 (number형)
      }),
    });

    const result = await response.json();

    // 서버 응답이 성공(200 OK)이고 result.success가 true인 경우
    if (response.ok && result.success) {
      return {
        success: true,
        message: result.message || "마일리지 지급이 완료되었습니다.",
        data: result.data
      };
    }

    return {
      success: false,
      message: result.message || "마일리지 지급에 실패했습니다."
    };
  } catch (error) {
    console.error("수동 업데이트 오류:", error);
    return { success: false, message: "서버 통신 중 오류가 발생했습니다." };
  }
};

/**
 * 테스트용 포인트 데이터 (Mock Data)
 */
const getMockPointData = (): PointHistoryItem[] => {
  return [
    { id: 1, description: "제1 회 NIMDACON 참여", amount: 100, date: "03.03", type: "earn" },
    { id: 2, description: "제1 회 NIMDACON 참여", amount: 100, date: "25.12.28", type: "earn" },
    { id: 6, description: "프로필 아이콘 구매", amount: -20, date: "25.12.28", type: "use" },
  ];
};