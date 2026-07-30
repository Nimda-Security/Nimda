// 비밀번호 찾기(재설정) 관련 API 함수들
// 백엔드 UserRecoveryController(api/cite/passwordChange/**)와 대응
// 인증 상태는 HttpOnly 쿠키(password_change_token)로 관리되므로 모든 요청에 credentials: 'include' 필수

import { addVersionToHeaders } from '../constants/version';

const API_BASE_URL = '/api/cite/passwordChange';

export interface CheckUserValidateRequest {
  userId: string;
  studentNum: string;
  email: string;
}

export interface CheckUserValidateResult {
  validateUserId: boolean;
  validateStudentNum: boolean;
  validateEmail: boolean;
}

export interface CheckUserInfoResponse {
  success: boolean;
  message: string;
  data?: CheckUserValidateResult;
}

/**
 * 비밀번호 찾기 1단계: 아이디/학번/이메일 일치 여부 확인
 * 성공 시 서버가 password_change_token 쿠키(5분)를 내려줌.
 * 세 항목이 실제로 일치하는지는 data의 validateUserId/validateStudentNum/validateEmail로 판단해야 함
 * (응답 자체는 검증 실패 시에도 HTTP 200으로 내려옴)
 */
export const checkUserInfoAPI = async (
  req: CheckUserValidateRequest
): Promise<CheckUserInfoResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/info-check`, {
      method: 'POST',
      headers: addVersionToHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(req),
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

    if (response.ok) {
      return {
        success: true,
        message: result.message || '조회 성공',
        data: result.data,
      };
    }
    return {
      success: false,
      message: result.message || `확인에 실패했습니다. (${response.status})`,
    };
  } catch (error) {
    console.error('유저 정보 확인 API 오류:', error);
    return {
      success: false,
      message: '서버에 연결할 수 없습니다.',
    };
  }
};

/**
 * 비밀번호 찾기 2단계: 인증 메일 발송
 * info-check에서 발급된 쿠키가 필요 (credentials: 'include'로 자동 전송됨)
 */
export const sendAuthMailAPI = async (
  req: CheckUserValidateRequest
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/send-authMail`, {
      method: 'POST',
      headers: addVersionToHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(req),
    });

    // 이 엔드포인트는 항상 HTTP 200으로 응답하고, 본문에 "OK" | "UNAUTHORIZED" 문자열만 담아 보냄
    const text = (await response.text()).replace(/^"|"$/g, '');

    if (response.ok && text === 'OK') {
      return { success: true, message: '인증 메일이 발송되었습니다.' };
    }
    return {
      success: false,
      message: '인증 세션이 만료되었습니다. 처음부터 다시 시도해주세요.',
    };
  } catch (error) {
    console.error('인증 메일 발송 API 오류:', error);
    return { success: false, message: '서버에 연결할 수 없습니다.' };
  }
};

/**
 * 비밀번호 찾기 3단계: 인증 코드 확인
 * 성공 시 서버가 이메일 인증 완료 상태를 담은 쿠키를 재발급함
 */
export const checkAuthCodeAPI = async (
  authCode: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/check-authcode`, {
      method: 'POST',
      headers: addVersionToHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ authCode }),
    });

    const message = await response.text();
    return {
      success: response.ok,
      message: message || (response.ok ? '인증이 완료되었습니다.' : '인증에 실패했습니다.'),
    };
  } catch (error) {
    console.error('인증 코드 확인 API 오류:', error);
    return { success: false, message: '서버에 연결할 수 없습니다.' };
  }
};

/**
 * 비밀번호 찾기 4단계: 새 비밀번호로 변경
 * check-authcode 단계까지 완료된 쿠키가 있어야 성공함
 */
export const changePasswordAPI = async (
  password: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/change-password`, {
      method: 'POST',
      headers: addVersionToHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ password }),
    });

    const message = await response.text();
    return {
      success: response.ok,
      message: message || (response.ok ? '비밀번호가 재설정되었습니다.' : '비밀번호 변경에 실패했습니다.'),
    };
  } catch (error) {
    console.error('비밀번호 변경 API 오류:', error);
    return { success: false, message: '서버에 연결할 수 없습니다.' };
  }
};
