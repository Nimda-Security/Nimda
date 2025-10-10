// 관리자 관련 API 함수들

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const parseJsonSafe = async (response) => {
  try {
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
};

/**
 * 모든 사용자 조회 API
 */
export const getAllUsersAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    const result = await parseJsonSafe(response);

    if (response.ok) {
      return result ?? { success: true, users: [] };
    }

    return {
      success: false,
      status: response.status,
      message:
        (result && result.message) ||
        (response.status === 403
          ? "권한이 없습니다. 관리자 계정으로 로그인하세요."
          : "사용자 목록을 불러올 수 없습니다."),
    };
  } catch (error) {
    console.error("사용자 목록 조회 API 오류:", error);
    return { success: false, message: "사용자 목록을 불러올 수 없습니다." };
  }
};

/**
 * 사용자 삭제 API
 */
export const deleteUserAPI = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    const result = await parseJsonSafe(response);
    if (response.ok) {
      return result ?? { success: true };
    }
    return {
      success: false,
      status: response.status,
      message:
        (result && result.message) ||
        (response.status === 403
          ? "권한이 없습니다. 관리자 계정으로 로그인하세요."
          : "사용자 삭제 중 오류가 발생했습니다."),
    };
  } catch (error) {
    console.error("사용자 삭제 API 오류:", error);
    return { success: false, message: "사용자 삭제 중 오류가 발생했습니다." };
  }
};

/**
 * 사용자 권한 변경 API
 */
export const updateUserRoleAPI = async (userId, role) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ role }),
    });

    const result = await parseJsonSafe(response);
    if (response.ok) {
      return result ?? { success: true };
    }
    return {
      success: false,
      status: response.status,
      message:
        (result && result.message) ||
        (response.status === 403
          ? "권한이 없습니다. 관리자 계정으로 로그인하세요."
          : "사용자 권한 변경 중 오류가 발생했습니다."),
    };
  } catch (error) {
    console.error("사용자 권한 변경 API 오류:", error);
    return {
      success: false,
      message: "사용자 권한 변경 중 오류가 발생했습니다.",
    };
  }
};
