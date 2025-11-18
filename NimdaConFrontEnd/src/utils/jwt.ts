// JWT 토큰에서 닉네임 가져오기
export const getCurrentNickname = (): string | null => {
  const token = localStorage.getItem('authToken'); // 1. 로컬 스토리지에서 저장된 JWT 토큰 가져오기 
  if (!token) return null; // 2. 토큰이 없다면 Null 
  const payload = JSON.parse(atob(token.split('.')[1])); 
  // 백엔드에서 subject에 nickname을 저장하므로 sub 또는 nickname 필드 사용
  return payload.nickname || payload.sub || null; // 닉네임 추출 
};

// 하위 호환성을 위한 함수 (deprecated)
export const getCurrentUsername = (): string | null => {
  return getCurrentNickname();
};

// JWT 구조 Header, Payload, Signature 
// const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsIm5pY2tuYW1lIjoiYWRtaW4ifQ.signature";
// const parts = token.split('.'); // [header, payload, signature]
// const payload = parts[1]; // "eyJzdWIiOiJhZG1pbiIsIm5pY2tuYW1lIjoiYWRtaW4ifQ"
// const decoded = atob(payload); // '{"sub":1,"nickname":"admin"}'
// const data = JSON.parse(decoded); // {sub: 1, nickname: "admin"}

// 문자열로 변환한 이유 : Http Header는 문자열만 전송 가능하기 때문.
// localStorage 또한 문자열만 저장 가능

// 관리자 권한 체크 (JWT 토큰의 권한 정보에서 ROLE_ADMIN 확인)
export const isAdmin = (): boolean => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.log('[isAdmin] No token found');
    return false;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('[isAdmin] Full JWT payload:', payload);
    
    const authorities = payload.authorities || [];
    console.log('[isAdmin] Authorities from token:', authorities);
    console.log('[isAdmin] Is array?', Array.isArray(authorities));
    console.log('[isAdmin] Includes ROLE_ADMIN?', Array.isArray(authorities) && authorities.includes('ROLE_ADMIN'));
    
    // 권한 목록에 ROLE_ADMIN이 있는지 확인
    const isAdminResult = Array.isArray(authorities) && authorities.includes('ROLE_ADMIN');
    console.log('[isAdmin] Final result:', isAdminResult);
    
    return isAdminResult;
  } catch (error) {
    console.error('[isAdmin] Failed to parse JWT token:', error);
    return false;
  }
}; 
