// @/api/point.ts
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
        // 백엔드 dto 필드명인 totalAmount를 currentBalance로 매핑
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
 * 백엔드 PointDetailResponse DTO: { description, amount, createdAt 등 }
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
      // 백엔드에서 데이터가 온 경우
      if (result.data.length > 0) {
        return result.data.map((item: any) => ({
          id: item.id,
          description: item.description,
          amount: item.amount,
          date: item.createdAt ? item.createdAt.substring(5, 10).replace('-', '.') : "00.00",
          type: item.amount > 0 ? "earn" : (item.amount < 0 ? "use" : "expire"),
        }));
      }
      
      // 백엔드 데이터가 비어있으면 테스트 데이터 반환
      console.warn("백엔드 포인트 데이터가 비어있습니다. 테스트 데이터를 사용합니다.");
      return getMockPointData();
    }
    
    return [];
  } catch (error) {
    console.error("상세 내역 조회 오류:", error);
    return [];
  }
};

/**
 * 테스트용 포인트 데이터
 */
const getMockPointData = (): PointHistoryItem[] => {
  return [
    {
      id: 1,
      description: "제1 회 NIMDACON 참여",
      amount: 100,
      date: "03.03",
      type: "earn",
    },
    {
      id: 2,
      description: "제1 회 NIMDACON 참여",
      amount: 100,
      date: "25.12.28",
      type: "earn",
    },
    {
      id: 3,
      description: "초기 지원금",
      amount: 1334,
      date: "25.12.28",
      type: "earn",
    },
    {
      id: 4,
      description: "초기 지원금",
      amount: 10,
      date: "25.12.28",
      type: "earn",
    },
    {
      id: 5,
      description: "초기 지원금",
      amount: 10,
      date: "25.12.28",
      type: "earn",
    },
    {
      id: 6,
      description: "프로필 아이콘 - 고양이 귀 구매",
      amount: -20,
      date: "25.12.28",
      type: "use",
    },
    {
      id: 7,
      description: "프로필 아이콘 - 고양이 귀 구매",
      amount: -20,
      date: "25.12.28",
      type: "use",
    },
  ];
};

/**
 * 3. 마일리지 수동 업데이트 (POST /api/cite/point)
 */
export const updatePointManual = async (description: string, amount: number) => {
  try {
    const authToken = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      body: JSON.stringify({ description, amount }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("수동 업데이트 오류:", error);
    return { success: false };
  }
};
