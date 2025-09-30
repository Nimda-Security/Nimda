// JWT 토큰에서 사용자명 가져오기
export const getCurrentUsername = (): string | null => {
  const token = localStorage.getItem('authToken'); // 1. 로컬 스토리지에서 저장된 JWT 토큰 가져오기 
  if (!token) return null; // 2. 토큰이 없다면 Null 
  const payload = JSON.parse(atob(token.split('.')[1])); 
  return payload.username; // 사용자명 추출 
};

// const payload = JSON.parse(atob(token.split('.')[1])); 
// JSON.parse() - JSON 문자열을 객체로 변환 
// atob() : BASE64 디코딩 (JWT 토큰은 BASE64 인코딩을 사용하기 때문)

// JWT 구조 Header, Payload, Signature 
// const token = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFkbWluIn0.signature";
// const parts = token.split('.'); // [header, payload, signature]
// const payload = parts[1]; // "eyJ1c2VybmFtZSI6ImFkbWluIn0"
// const decoded = atob(payload); // '{"username":"admin"}'
// const data = JSON.parse(decoded); // {username: "admin"}

// 문자열로 변환한 이유 : Http Header는 문자열만 전송 가능하기 때문.
// localStorage 또한 문자열만 저장 가능

// 관리자 권한 체크 (username이 'admin'인지 확인)
export const isAdmin = (): boolean => {
  const username = getCurrentUsername();
  return username === 'admin';
}; 
