// 관리자 관련 API 함수들

const API_BASE_URL = "/api";

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
      },
      credentials: "include",
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
 * 특정 사용자 상세 조회 API (profileImage presigned URL 포함)
 */
export const getAdminUserDetailAPI = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await parseJsonSafe(response);

    if (response.ok) {
      return { success: true, user: result };
    }

    return {
      success: false,
      status: response.status,
      message:
        (result && result.message) ||
        "사용자 정보를 불러올 수 없습니다.",
    };
  } catch (error) {
    console.error("사용자 상세 조회 API 오류:", error);
    return { success: false, message: "사용자 정보를 불러올 수 없습니다." };
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
      },
      credentials: "include",
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
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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

/**
 * 사용자 권한 제거 API
 */
export const removeUserRoleAPI = async (userId, role) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role/remove`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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
          : "사용자 권한 제거 중 오류가 발생했습니다."),
    };
  } catch (error) {
    console.error("사용자 권한 제거 API 오류:", error);
    return {
      success: false,
      message: "사용자 권한 제거 중 오류가 발생했습니다.",
    };
  }
};

/**
 * 서버에 등록된 권한 목록 조회 API
 */
export const getAvailableRolesAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await parseJsonSafe(response);

    if (response.ok) {
      return {
        success: true,
        roles: result?.roles || [],
      };
    }

    return {
      success: false,
      status: response.status,
      message:
        (result && result.message) ||
        (response.status === 403
          ? "권한이 없습니다. 관리자 계정으로 로그인하세요."
          : "권한 목록을 불러올 수 없습니다."),
    };
  } catch (error) {
    console.error("권한 목록 조회 API 오류:", error);
    return { success: false, message: "권한 목록을 불러올 수 없습니다." };
  }
};

/**
 * 승인 대기 사용자 목록 조회 API
 */
export const getPendingUsersAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/pending`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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
          : "승인 대기 사용자 목록을 불러올 수 없습니다."),
    };
  } catch (error) {
    console.error("승인 대기 사용자 목록 조회 API 오류:", error);
    return { success: false, message: "승인 대기 사용자 목록을 불러올 수 없습니다." };
  }
};

/**
 * 사용자 승인 API
 */
export const approveUserAPI = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/approve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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
          : "사용자 승인 중 오류가 발생했습니다."),
    };
  } catch (error) {
    console.error("사용자 승인 API 오류:", error);
    return { success: false, message: "사용자 승인 중 오류가 발생했습니다." };
  }
};

/**
 * 사용자 거부 API
 */
export const rejectUserAPI = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/reject`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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
          : "사용자 거부 중 오류가 발생했습니다."),
    };
  } catch (error) {
    console.error("사용자 거부 API 오류:", error);
    return { success: false, message: "사용자 거부 중 오류가 발생했습니다." };
  }
};

/**
 * 스터디 그룹 목록 조회 API
 */
export const getAllGroupsAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await parseJsonSafe(response);

    if (response.ok) {
      return {
        success: true,
        groups: result ?? [],
      };
    }

    return {
      success: false,
      status: response.status,
      message:
        (result && result.message) ||
        "스터디 그룹 목록을 불러오는 중 오류가 발생했습니다.",
    };
  } catch (error) {
    console.error("스터디 그룹 목록 API 오류:", error);
    return {
      success: false,
      message: "스터디 그룹 목록을 불러오는 중 오류가 발생했습니다.",
    };
  }
};

/**
 * 스터디 그룹 생성 API
 */
export const createGroupAPI = async (groupData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(groupData),
    });

    const result = await parseJsonSafe(response);

    if (response.ok) {
      return {
        success: true,
        group: result,
      };
    }

    return {
      success: false,
      status: response.status,
      message:
        (result && result.message) ||
        "스터디 그룹 생성 중 오류가 발생했습니다.",
    };
  } catch (error) {
    console.error("스터디 그룹 생성 API 오류:", error);
    return {
      success: false,
      message: "스터디 그룹 생성 중 오류가 발생했습니다.",
    };
  }
};

/**
 * 카테고리의 태그별 게시글 통계 조회 API
 */
export const getTagStatsAPI = async (categoryId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/boards/tag-stats?categoryId=${categoryId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    const result = await parseJsonSafe(response);
    if (response.ok) {
      return result ?? { success: true, tagStats: [] };
    }
    return {
      success: false,
      status: response.status,
      message: (result && result.message) || "태그 통계를 불러올 수 없습니다.",
    };
  } catch (error) {
    console.error("태그 통계 조회 API 오류:", error);
    return { success: false, message: "태그 통계를 불러올 수 없습니다." };
  }
};

/**
 * 태그 기반 게시글 비활성화 API (ACTIVE → HIDDEN)
 */
export const deactivateBoardsByTagAPI = async (categoryId, tagId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/boards/deactivate-by-tag?categoryId=${categoryId}&tagId=${tagId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    const result = await parseJsonSafe(response);
    if (response.ok) {
      return result ?? { success: true };
    }
    return {
      success: false,
      status: response.status,
      message: (result && result.message) || "비활성화에 실패했습니다.",
    };
  } catch (error) {
    console.error("태그 비활성화 API 오류:", error);
    return { success: false, message: "비활성화 중 오류가 발생했습니다." };
  }
};

/**
 * 태그 기반 게시글 활성화 API (HIDDEN → ACTIVE)
 */
export const activateBoardsByTagAPI = async (categoryId, tagId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/boards/activate-by-tag?categoryId=${categoryId}&tagId=${tagId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    const result = await parseJsonSafe(response);
    if (response.ok) {
      return result ?? { success: true };
    }
    return {
      success: false,
      status: response.status,
      message: (result && result.message) || "활성화에 실패했습니다.",
    };
  } catch (error) {
    console.error("태그 활성화 API 오류:", error);
    return { success: false, message: "활성화 중 오류가 발생했습니다." };
  }
};
