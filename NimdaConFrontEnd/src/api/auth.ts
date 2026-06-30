// 인증 관련 API 함수들
import { addVersionToHeaders } from '../constants/version';

const API_BASE_URL = "/api";
let sessionTimeoutId: number | null = null;
export interface LoginRequest {
  userId: string;
  password: string;
  clientVersion?: string;
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
    major?: string;
    birth?: string;
    studentNum?: string;
    profileImage?: string | null;
    profileDecoration?: string | null;
    roles?: string[];
  };
}

export const PROFILE_UPDATED_EVENT = 'nimda:profile-updated';

const setStoredUser = (user: Record<string, unknown> | null) => {
  if (!user) {
    localStorage.removeItem('user');
    return;
  }
  localStorage.setItem('user', JSON.stringify(user));
};


export function setSessionPopupTimer(): void {
  if (sessionTimeoutId !== null) {
    clearTimeout(sessionTimeoutId);
  }

  const delayTime: number = 24 * 60 * 60 * 1000;
  sessionTimeoutId = window.setTimeout(showExtensionPopup, delayTime);
}

function showExtensionPopup(): void {
  alert("세션이 만료되었습니다. 다시 로그인해주세요.");

  window.location.href = "/login";
}

export const mergeStoredUser = (updates: Record<string, unknown>) => {
  const currentUser = getCurrentUser() ?? {};
  const nextUser = { ...currentUser, ...updates };
  setStoredUser(nextUser);
  window.dispatchEvent(
    new CustomEvent(PROFILE_UPDATED_EVENT, {
      detail: nextUser,
    })
  );
  return nextUser;
};

export interface RegisterRequest {
  userId: string;
  name: string;
  nickname: string;
  password: string;
  studentNum: string;
  email: string;
  major: string;
  bojId?: string;
  birth?: string;
  clientVersion?: string;
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
      headers: addVersionToHeaders({
        "Content-Type": "application/json",
      }),
      credentials: "include",
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
      // 쿠키 기반 인증: 토큰은 HttpOnly 쿠키로 관리, 사용자 정보만 localStorage에 저장
      if (userInfo) {
        setStoredUser(userInfo);
        if (userInfo.roles) {
          localStorage.setItem("roles", JSON.stringify(userInfo.roles));
        }
      }

      setSessionPopupTimer();

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
 * @param registerData - 유저가 입력한 회원가입 정보
 * @returns 성공 여부 및 결과 메시지
 */
export const registerAPI = async (
  registerData: RegisterRequest
): Promise<LoginResponse> => {
  try {
    // 1. 서버로 보낼 데이터 정제 (cleanedData)
    // 필수 필드는 그대로 가져오고, 선택적 필드는 가공하여 처리합니다.
    const cleanedData = {
      userId: registerData.userId.trim(),
      name: registerData.name.trim(),
      nickname: registerData.nickname.trim(),
      password: registerData.password, // 비밀번호는 공백 제거를 하지 않는 것이 일반적입니다.
      studentNum: registerData.studentNum.trim(),
      email: registerData.email.trim(),
      major: registerData.major.trim(),

      // 생년월일: 하이픈(-) 제거 후 8자리 숫자로 통일 (예: 20260321)
      birth: (registerData.birth ?? "").replace(/-/g, "").trim(),

      // 선택 필드: 값이 비어있거나 공백만 있다면 서버에 보내지 않도록 처리
      bojId: registerData.bojId?.trim() || undefined,
    };

    // 2. 서버 API 호출
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: addVersionToHeaders({
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify(cleanedData),
    });

    // 3. 응답 데이터 파싱
    let result;
    try {
      result = await response.json();
    } catch (e) {
      // 서버에서 JSON이 아닌 에러 페이지(HTML) 등을 보냈을 경우
      return {
        success: false,
        message: `서버 내부 오류 (${response.status}): 응답 형식이 올바르지 않습니다.`,
      };
    }

    // 4. 결과 반환
    if (response.ok) {
      return {
        success: true,
        message: "회원가입이 완료되었습니다.",
        user: result.data ?? result, // 백엔드 응답 구조에 따라 data 필드 여부 확인
      };
    } else {
      // 백엔드 validation 에러 메시지가 있으면 우선 사용, 없으면 상태 코드별 기본 메시지
      const errorMessage =
        result.message ||
        (response.status === 400
          ? "입력하신 정보를 다시 확인해 주세요."
          : `회원가입 실패 (오류 코드: ${response.status})`);

      return {
        success: false,
        message: errorMessage,
      };
    }
  } catch (error) {
    // 네트워크 단절 등 예외 상황 처리
    console.error("회원가입 API 호출 중 치명적 오류:", error);
    return {
      success: false,
      message: "서버와 통신할 수 없습니다. 네트워크 연결을 확인해 주세요.",
    };
  }
};

/**
 * 로그아웃
 */
export const logoutAPI = async () => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: addVersionToHeaders(),
      credentials: "include",
    });
  } catch {
    // 서버 응답 실패 시도 로컬 정리 진행
  }
  localStorage.removeItem("user");
  localStorage.removeItem("roles");
  window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: null }));
};

/**
 * 현재 로그인된 사용자 정보 가져오기 (localStorage)
 */
export const getCurrentUser = (): Record<string, any> | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * 내 정보 조회 (서버 API)
 */
export const getMyPageInfo = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: addVersionToHeaders({
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });

    const result = await response.json();

    if (response.ok) {
      return { success: true, message: "조회 성공", data: result.data ?? result };
    } else {
      return {
        success: false,
        message: result.message || "정보 조회에 실패했습니다.",
        data: null,
      };
    }
  } catch (error) {
    console.error("내 정보 조회 오류:", error);
    return {
      success: false,
      message: "서버에 연결할 수 없습니다.",
      data: null,
    };
  }
};
/**
 * 이메일 숨김 상태 토글 API (fetch 버전)
 */
export const toggleEmailHide = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/email-hide`, {
      method: "POST",
      headers: addVersionToHeaders({
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify({}),
    });

    let result;
    try {
      result = await response.json();
    } catch (e) {
      return {
        success: false,
        message: `서버 오류 (${response.status}): 응답을 파싱할 수 없습니다.`,
      };
    }

    if (response.ok) {
      // 백엔드에서 준 { success: true, emailHide: boolean, ... } 반환
      return {
        success: true,
        message: result.message || "변경 성공",
        emailHide: result.emailHide
      };
    } else {
      // 403 Forbidden 등 에러 처리
      const errorMessage = result.message || `변경에 실패했습니다. (${response.status})`;
      return {
        success: false,
        message: errorMessage,
      };
    }
  } catch (error) {
    console.error("이메일 상태 변경 API 에러:", error);
    return {
      success: false,
      message: "서버에 연결할 수 없습니다.",
    };
  }
};



/**
 * 토큰 가져오기
 * 쿠키 기반 인증으로 전환 — HttpOnly 쿠키는 JS에서 직접 읽을 수 없으므로 null 반환
 */
export const getAuthToken = () => {
  return null;
};

/**
 * 로그인 상태 확인
 * localStorage의 user 정보 존재 여부로 판단
 */
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem("user");
};

/**
 * 서버에 세션(쿠키) 유효성 검증
 * 쿠키가 실제 인증 수단이므로 localStorage와 무관하게 항상 서버에 확인
 * 쿠키가 만료되었거나 유효하지 않으면 localStorage를 정리하고 false 반환
 */
export const validateSession = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: addVersionToHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
    });
    if (response.ok) return true;
    // 401/403 등 → 쿠키 만료 또는 무효
    localStorage.removeItem("user");
    localStorage.removeItem("roles");
    return false;
  } catch {
    // 네트워크 오류 시에는 로그아웃 처리하지 않음 (일시적 오류일 수 있음)
    return true;
  }
};

/**
 * 프로필 정보 수정 API
 * null인 필드는 수정하지 않음 (부분 업데이트)
 */
export interface UpdateProfileRequest {
  nickname?: string;
  bojId?: string;
  birth?: string;
  major?: string;
  studentNum?: string;
}

export const updateProfileAPI = async (
  data: UpdateProfileRequest
): Promise<{ success: boolean; message: string; data?: Record<string, unknown> }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "PUT",
      headers: addVersionToHeaders({
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify(data),
    });

    let result;
    try {
      result = await response.json();
    } catch {
      return {
        success: false,
        message: `서버 오류 (${response.status}): 응답을 파싱할 수 없습니다.`,
      };
    }

    if (response.ok && result.success) {
      return {
        success: true,
        message: result.message || "프로필이 수정되었습니다.",
        data: result.data,
      };
    } else {
      return {
        success: false,
        message: result.message || `프로필 수정에 실패했습니다. (${response.status})`,
      };
    }
  } catch (error) {
    console.error("프로필 수정 API 오류:", error);
    return {
      success: false,
      message: "서버에 연결할 수 없습니다.",
    };
  }
};

/**
 * 프로필 이미지 변경 API (S3 키 전달)
 */
export const updateProfileImageAPI = async (
  profileImageKey: string
): Promise<{ success: boolean; message: string; profileImageUrl?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile-image`, {
      method: "PUT",
      headers: addVersionToHeaders({
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify({ profileImageKey }),
    });

    let result;
    try {
      result = await response.json();
    } catch {
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          message: '로그인 세션이 만료되었거나 권한이 없습니다. 다시 로그인해 주세요.',
        };
      }
      return {
        success: false,
        message: `서버 오류 (${response.status})`,
      };
    }

    if (response.ok && result.success) {
      mergeStoredUser({
        profileImage: result.profileImageUrl ?? null,
      });
      return {
        success: true,
        message: result.message || "프로필 이미지가 변경되었습니다.",
        profileImageUrl: result.profileImageUrl,
      };
    } else {
      return {
        success: false,
        message: result.message || "프로필 이미지 변경에 실패했습니다.",
      };
    }
  } catch (error) {
    console.error("프로필 이미지 변경 API 오류:", error);
    return {
      success: false,
      message: "서버에 연결할 수 없습니다.",
    };
  }
};

export const updateProfileDecorationAPI = async (
  profileDecorationKey: string | null
): Promise<{ success: boolean; message: string; profileDecoration?: string | null }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile-decoration`, {
      method: 'PUT',
      headers: addVersionToHeaders({
        'Content-Type': 'application/json',
      }),
      credentials: 'include',
      body: JSON.stringify({ profileDecorationKey }),
    });

    let result;
    try {
      result = await response.json();
    } catch {
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          message: '로그인 세션이 만료되었거나 권한이 없습니다. 다시 로그인해 주세요.',
        };
      }
      return {
        success: false,
        message: `서버 오류 (${response.status})`,
      };
    }

    if (response.ok && result.success) {
      const nextDecoration =
        typeof result.profileDecoration === 'string' && result.profileDecoration
          ? result.profileDecoration
          : null;
      mergeStoredUser({
        profileDecoration: nextDecoration,
      });
      return {
        success: true,
        message: result.message || '프로필 장식이 변경되었습니다.',
        profileDecoration: nextDecoration,
      };
    }

    return {
      success: false,
      message:
        result.message ||
        (response.status === 401 || response.status === 403
          ? '로그인 세션이 만료되었거나 권한이 없습니다. 다시 로그인해 주세요.'
          : '프로필 장식 변경에 실패했습니다.'),
    };
  } catch (error) {
    console.error('프로필 장식 변경 API 오류:', error);
    return {
      success: false,
      message: '서버에 연결할 수 없습니다.',
    };
  }
};
