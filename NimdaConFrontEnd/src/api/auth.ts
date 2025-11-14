// 인증 관련 API 함수들

const API_BASE_URL = "/api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

/**
 * 로그인 API 호출
 */
export const loginAPI = async (
  loginData: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    const result = await response.json();

    // 백엔드 응답 형태가 access_token(legacy) 또는 accessToken(new) 둘 다 가능
    const accessToken = result.access_token ?? result.accessToken;
    const userInfo = result.user;

    if (response.ok) {
      // 로그인 성공 시 토큰 저장 (access_token 키로 받음)
      if (accessToken) {
        localStorage.setItem("authToken", accessToken);
        if (userInfo) {
          localStorage.setItem("user", JSON.stringify(userInfo));
        }
      }

      return {
        success: true,
        message: "로그인 성공",
        token: accessToken,
        user: userInfo,
      };
    } else {
      // 로그인 실패
      return {
        success: false,
        message: result.message || "로그인에 실패했습니다.",
      };
    }
  } catch (error) {
    console.error("로그인 API 오류:", error);
    return {
      success: false,
      message: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
    };
  }
};

/**
 * 회원가입 API 호출
 */
export const registerAPI = async (
  registerData: RegisterRequest
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: "회원가입이 완료되었습니다.",
        user: result,
      };
    } else {
      return {
        success: false,
        message: result.message || "회원가입에 실패했습니다.",
      };
    }
  } catch (error) {
    console.error("회원가입 API 오류:", error);
    return {
      success: false,
      message: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
    };
  }
};

/**
 * 로그아웃
 */
export const logoutAPI = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};

/**
 * 현재 로그인된 사용자 정보 가져오기
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * 토큰 가져오기
 */
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

/**
 * 로그인 상태 확인
 */
export const isLoggedIn = (): boolean => {
  const token = getAuthToken();
  return !!token;
};
