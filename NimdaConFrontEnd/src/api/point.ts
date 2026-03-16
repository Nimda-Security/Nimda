// 포인트/마일리지 관련 API 함수들

const API_BASE_URL = "/api";

export interface PointHistoryItem {
  id?: number;
  description: string;
  amount: number;
  date: string;
  type?: "earn" | "use" | "expire";
}

export interface UserBalance {
  userId: number;
  currentBalance: number;
  nickname?: string;
  createdDate?: string;
}

export interface PointHistoryResponse {
  success: boolean;
  message: string;
  data?: {
    currentBalance?: number;
    earnedTotal?: number;
    usedTotal?: number;
    expiredTotal?: number;
    history?: PointHistoryItem[];
  };
  currentBalance?: number;
}

export interface UpdatePointRequest {
  userId: number;
  description: string;
  amount: number;
}

/**
 * 사용자 마일리지 잔액 조회
 */
export const getUserBalance = async (
  userId?: number
): Promise<PointHistoryResponse> => {
  try {
    const authToken = localStorage.getItem("authToken");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/cite/point`, {
      method: "GET",
      headers,
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: "마일리지 조회 성공",
        data,
        currentBalance: data.currentBalance || data.balance || 0,
      };
    } else {
      return {
        success: false,
        message: data.message || "마일리지 조회 실패",
      };
    }
  } catch (error) {
    console.error("마일리지 조회 오류:", error);
    return {
      success: false,
      message: "마일리지 조회 중 오류가 발생했습니다.",
    };
  }
};

/**
 * 마일리지 업데이트 (수동)
 */
export const updatePointManual = async (
  updateData: UpdatePointRequest
): Promise<PointHistoryResponse> => {
  try {
    const authToken = localStorage.getItem("authToken");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/cite/point`, {
      method: "POST",
      headers,
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: "마일리지 업데이트 성공",
        data,
        currentBalance: data.currentBalance || 0,
      };
    } else {
      return {
        success: false,
        message: data.message || "마일리지 업데이트 실패",
      };
    }
  } catch (error) {
    console.error("마일리지 업데이트 오류:", error);
    return {
      success: false,
      message: "마일리지 업데이트 중 오류가 발생했습니다.",
    };
  }
};

/**
 * 마일리지 거래 내역 조회 (필터링)
 */
export const getPointHistory = async (
  type?: "earn" | "use" | "expire"
): Promise<PointHistoryResponse> => {
  try {
    const authToken = localStorage.getItem("authToken");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    let url = `${API_BASE_URL}/cite/point`;
    if (type) {
      url += `?type=${type}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: "거래 내역 조회 성공",
        data,
      };
    } else {
      return {
        success: false,
        message: data.message || "거래 내역 조회 실패",
      };
    }
  } catch (error) {
    console.error("거래 내역 조회 오류:", error);
    return {
      success: false,
      message: "거래 내역 조회 중 오류가 발생했습니다.",
    };
  }
};
