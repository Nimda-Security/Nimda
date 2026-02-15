// Board 도메인 상수 정의

/**
 * 카테고리 Slug (기본 카테고리)
 */
export const CATEGORY_SLUGS = {
  NEWS: 'news',
  ACADEMIC: 'academic',
  COMMUNITY: 'community',
  QNA: 'qna',
  FREE: 'free',
} as const;

/**
 * 카테고리 Slug 배열
 */
export const CATEGORY_SLUG_ARRAY = Object.values(CATEGORY_SLUGS);

/**
 * 카테고리 Slug별 라벨 (한글)
 */
export const CATEGORY_LABELS: Record<string, string> = {
  news: '새 소식',
  academic: '학술 게시판',
  community: '커뮤니티',
  qna: '질문과 답변',
  free: '자유 게시판',
};

/**
 * 카테고리 Slug별 설명
 */
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  news: '동아리 관련 공지사항과 새 소식을 확인하세요',
  academic: '학술적인 내용과 자료를 공유하는 게시판입니다',
  community: '회원들 간의 소통과 정보 공유 공간입니다',
  qna: '궁금한 점을 질문하고 답변을 받아보세요',
  free: '자유롭게 이야기를 나누는 게시판입니다',
};

/**
 * 페이지네이션 기본값
 */
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 0;

/**
 * 카테고리 Slug에 따른 라우트 경로 매핑
 */
export const CATEGORY_ROUTES: Record<string, string> = {
  news: '/board/news',
  academic: '/board/academic',
  community: '/board/community',
  qna: '/board/qna',
  free: '/board/free',
};

/**
 * 라우트 경로에서 카테고리 Slug 추출
 */
export const ROUTE_TO_CATEGORY_SLUG: Record<string, string> = {
  '/board/news': 'news',
  '/board/academic': 'academic',
  '/board/community': 'community',
  '/board/qna': 'qna',
  '/board/free': 'free',
};

