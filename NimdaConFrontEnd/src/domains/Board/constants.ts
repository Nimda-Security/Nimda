// Board 도메인 상수 정의

import type { BoardType } from './types';

/**
 * 게시판 타입별 라벨 (한글)
 */
export const BOARD_TYPE_LABELS: Record<BoardType, string> = {
  NEWS: '새 소식',
  ACADEMIC: '학술 게시판',
  COMMUNITY: '커뮤니티',
  QNA: '질문과 답변',
  FREE: '자유 게시판',
};

/**
 * 게시판 타입별 설명
 */
export const BOARD_TYPE_DESCRIPTIONS: Record<BoardType, string> = {
  NEWS: '동아리 관련 공지사항과 새 소식을 확인하세요',
  ACADEMIC: '학술적인 내용과 자료를 공유하는 게시판입니다',
  COMMUNITY: '회원들 간의 소통과 정보 공유 공간입니다',
  QNA: '궁금한 점을 질문하고 답변을 받아보세요',
  FREE: '자유롭게 이야기를 나누는 게시판입니다',
};

/**
 * 게시판 타입 배열
 */
export const BOARD_TYPES: BoardType[] = ['NEWS', 'ACADEMIC', 'COMMUNITY', 'QNA', 'FREE'];

/**
 * 페이지네이션 기본값
 */
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 0;

/**
 * 게시판 타입에 따른 라우트 경로 매핑
 */
export const BOARD_TYPE_ROUTES: Record<BoardType, string> = {
  NEWS: '/board/news',
  ACADEMIC: '/board/academic',
  COMMUNITY: '/board/community',
  QNA: '/board/qna',
  FREE: '/board/free',
};

/**
 * 라우트 경로에서 게시판 타입 추출
 */
export const ROUTE_TO_BOARD_TYPE: Record<string, BoardType> = {
  '/board/news': 'NEWS',
  '/board/academic': 'ACADEMIC',
  '/board/community': 'COMMUNITY',
  '/board/qna': 'QNA',
  '/board/free': 'FREE',
};

