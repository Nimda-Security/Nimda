// JWT 토큰에서 닉네임 가져오기 (쿠키 기반 인증 전환 후: localStorage user 객체에서 조회)
export const getCurrentNickname = (): string | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.nickname || null;
  } catch {
    return null;
  }
};

// 하위 호환성을 위한 함수 (deprecated)
export const getCurrentUsername = (): string | null => {
  return getCurrentNickname();
};

// JWT 토큰에서 특정 권한(Role) 보유 여부 확인 (쿠키 기반 인증 전환 후: localStorage roles 배열에서 조회)
export const hasRole = (role: string): boolean => {
  const rolesStr = localStorage.getItem('roles');
  if (!rolesStr) return false;
  try {
    const roles: string[] = JSON.parse(rolesStr);
    return Array.isArray(roles) && roles.includes(role);
  } catch {
    return false;
  }
};

// 관리자 권한 체크
export const isAdmin = (): boolean => hasRole('ROLE_ADMIN');
