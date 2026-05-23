// 애플리케이션 버전 정보
// vite.config.ts에서 package.json으로부터 주입됨

declare global {
  var __APP_VERSION__: string;
}

export const APP_VERSION = (globalThis.__APP_VERSION__ || '0.0.0') as string;

/**
 * 모든 API 요청에 버전 정보를 추가합니다.
 * @param body 기본 요청 바디
 * @returns 버전 정보가 포함된 요청 바디
 */
export const addVersionToHeaders = (customHeaders: Record<string, string> = {}): Record<string, string> => {
  return {
    ...customHeaders,
    "X-App-Version": APP_VERSION, // 백엔드 인터셉터와 약속한 헤더 키값 매핑!
  };
};
