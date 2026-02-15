// 인증 관련 API 함수들

const API_BASE_URL = "/api";

export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    userId: string;
    nickname: string;
    email: string;
    universityName?: string;
    department?: string;
    grade?: string;
  };
}

export interface RegisterRequest {
  userId: string;
  name: string;
  nickname: string;
  password: string;
  studentNum: string;
  phoneNum: string;
  email: string;
  major: string;
  universityName?: string;
  grade?: string;
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

    let result;
    try {
      result = await response.json();
    } catch (e) {
      // JSON 파싱 실패 시
      return {
        success: false,
        message: `서버 오류 (${response.status}): 응답을 파싱할 수 없습니다.`,
      };
    }

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
      // 로그인 실패 (401 Unauthorized, 403 Forbidden 등)
      let errorMessage;
      if (response.status === 403) {
        // 승인 대기 상태인 계정의 경우 별도 메시지
        errorMessage = result.message || "승인 대기 중인 계정입니다. 관리자 승인 후 로그인할 수 있습니다.";
      } else if (response.status === 401) {
        errorMessage = result.message || "아이디 또는 비밀번호가 올바르지 않습니다.";
      } else {
        errorMessage = result.message || `로그인에 실패했습니다. (${response.status})`;
      }
      return {
        success: false,
        message: errorMessage,
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
    // 필수 필드는 항상 전송, 선택 필드는 빈 문자열일 경우 undefined로 변환
    const cleanedData: any = {
      userId: registerData.userId,
      name: registerData.name,
      nickname: registerData.nickname,
      password: registerData.password,
      studentNum: registerData.studentNum,
      phoneNum: registerData.phoneNum,
      email: registerData.email,
      major: registerData.major,
    };

    if (registerData.universityName?.trim()) {
      cleanedData.universityName = registerData.universityName.trim();
    }
    if (registerData.grade?.trim()) {
      cleanedData.grade = registerData.grade.trim();
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cleanedData),
    });

    let result;
    try {
      result = await response.json();
    } catch (e) {
      // JSON 파싱 실패 시
      return {
        success: false,
        message: `서버 오류 (${response.status}): 응답을 파싱할 수 없습니다.`,
      };
    }

    if (response.ok) {
      return {
        success: true,
        message: "회원가입이 완료되었습니다.",
        user: result,
      };
    } else {
      // 회원가입 실패 (400 Bad Request 등)
      const errorMessage = result.message ||
        (response.status === 400 ? "입력한 정보를 확인해주세요." :
          `회원가입에 실패했습니다. (${response.status})`);
      return {
        success: false,
        message: errorMessage,
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
