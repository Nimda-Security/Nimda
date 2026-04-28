// 유저 공개 프로필 관련 API 함수들

const API_BASE_URL = '/api';

export interface UserPublicProfile {
  nickname: string;
  profileImage?: string | null;
  profileDecoration?: string | null;
  bojId?: string | null;
  major?: string | null;
  createdAt?: string;
  email?: string | null;
}

export interface UserComment {
  id: number;
  context: string;
  likeCount: number;
  createdAt: string;
  boardId: number;
}

/**
 * 닉네임으로 유저 공개 프로필 조회
 */
export async function getUserProfileByNickname(nickname: string): Promise<UserPublicProfile | null> {
  const res = await fetch(`${API_BASE_URL}/users/nickname/${encodeURIComponent(nickname)}`, { credentials: 'include' });
  if (!res.ok) return null;
  return res.json();
}

/**
 * 특정 유저가 작성한 게시글 목록 조회
 */
export async function getUserBoardsAPI(nickname: string) {
  const res = await fetch(`${API_BASE_URL}/cite/board/user/${encodeURIComponent(nickname)}`, { credentials: 'include' });
  if (!res.ok) return [];
  const data = await res.json();
  // ApiResponse 래퍼: { success, message, data: [...] }
  if (data && Array.isArray(data.data)) return data.data;
  // 직접 배열인 경우
  if (Array.isArray(data)) return data;
  return [];
}

/**
 * 특정 유저가 좋아요한 게시글 목록 조회 (공개)
 */
export interface LikedBoard {
  id: number;
  title: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  filepath?: string;
  authorNickname?: string;
  authorProfileImage?: string;
  authorProfileDecoration?: string;
}

export async function getUserLikedBoardsByNickname(nickname: string): Promise<LikedBoard[]> {
  const res = await fetch(`/api/like/board/user/${encodeURIComponent(nickname)}/liked`, { credentials: 'include' });
  if (!res.ok) return [];
  const data = await res.json();
  if (data?.success) {
    const boards = data.data?.boards || [];
    return boards.map((b: Record<string, unknown>) => {
      const author = b.author as Record<string, unknown> | undefined;
      return {
        id: b.id as number,
        title: b.title as string,
        likeCount: (b.likeCount as number) ?? 0,
        commentCount: (b.commentCount as number) ?? 0,
        createdAt: b.createdAt as string,
        filepath: b.filepath as string | undefined,
        authorNickname: author?.nickname as string | undefined,
        authorProfileImage: author?.profileImage as string | undefined,
        authorProfileDecoration: author?.profileDecoration as string | undefined,
      };
    });
  }
  return [];
}

/**
 * 특정 유저 마일리지 잔액 조회 (공개)
 */
export async function getUserPointBalanceByNickname(nickname: string): Promise<number> {
  const res = await fetch(`/api/cite/point/user/${encodeURIComponent(nickname)}`, { credentials: 'include' });
  if (!res.ok) return 0;
  const data = await res.json();
  if (data?.success) return data.data?.totalAmount ?? 0;
  return 0;
}

/**
 * 특정 유저 마일리지 내역 조회 (공개)
 */
export interface PointHistoryItem {
  id?: number;
  description: string;
  amount: number;
  date: string;
  type?: 'earn' | 'use' | 'expire';
}

export async function getUserPointDetailsByNickname(nickname: string): Promise<PointHistoryItem[]> {
  const res = await fetch(`/api/cite/point/user/${encodeURIComponent(nickname)}/details`, { credentials: 'include' });
  if (!res.ok) return [];
  const data = await res.json();
  if (data?.success && Array.isArray(data.data)) {
    return data.data.map((item: Record<string, unknown>) => ({
      id: item.id as number | undefined,
      description: item.description as string,
      amount: item.amount as number,
      date: item.createdAt ? String(item.createdAt).substring(5, 10).replace('-', '.') : '00.00',
      type: (item.amount as number) > 0 ? 'earn' : ((item.amount as number) < 0 ? 'use' : 'expire'),
    }));
  }
  return [];
}

/**
 * 특정 유저가 작성한 댓글 목록 조회 (공개)
 */
export async function getUserCommentsByNickname(nickname: string): Promise<UserComment[]> {
  const res = await fetch(`${API_BASE_URL}/comments/user/${encodeURIComponent(nickname)}`, { credentials: 'include' });
  if (!res.ok) return [];
  const data = await res.json();
  if (data?.success && Array.isArray(data.data?.comments)) return data.data.comments;
  return [];
}
