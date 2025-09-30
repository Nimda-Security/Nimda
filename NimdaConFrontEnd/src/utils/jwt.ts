// JWT 토큰에서 사용자명 가져오기
export const getCurrentUsername = (): string | null => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const decoded = atob(payloadBase64);
    const payload = JSON.parse(decoded) as { username?: string };
    return payload.username ?? null;
  } catch {
    return null;
  }
};

// 관리자 권한 체크 (username이 'admin'인지 확인)
export const isAdmin = (): boolean => {
  const username = getCurrentUsername();
  return username === "admin";
};
