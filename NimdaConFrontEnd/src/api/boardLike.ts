const API_BASE_URL = "/api/like/board";

export interface BoardLikeResponse {
  success: boolean;
  message: string;
  data: {
    likeCount: number;
    isLiked: boolean;
  };
}

/**
 * [GET] 내가 누른 좋아요 게시글 개수 조회 (마이페이지 수치용)
 * 백엔드: Map.of("likeCount", count)를 리턴하므로 키값을 맞춤
 */
export const getPushedBoardLikesCount = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pushedLikes/count`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`API 호출 실패 (${response.status}):`, await response.text());
      return 0;
    }

    const result = await response.json();
    return result.data?.likeCount || 0;
  } catch (error) {
    console.error("좋아요 개수 조회 실패:", error);
    return 0;
  }
};

/**
 * [POST] 게시글 좋아요 토글
 */
export const toggleBoardLike = async (boardId: number): Promise<BoardLikeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${boardId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`API 호출 실패 (${response.status}):`, await response.text());
      return {
        success: false,
        message: `좋아요 토글 실패 (${response.status})`,
        data: { likeCount: 0, isLiked: false },
      };
    }

    return await response.json();
  } catch (error) {
    console.error("좋아요 토글 실패:", error);
    return {
      success: false,
      message: String(error),
      data: { likeCount: 0, isLiked: false },
    };
  }
};

/**
 * [GET] 특정 게시글의 좋아요 상태 및 개수 확인
 */
export const getBoardLikeStatus = async (boardId: number): Promise<BoardLikeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${boardId}/likeStatus`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`API 호출 실패 (${response.status}):`, await response.text());
      return {
        success: false,
        message: `좋아요 상태 조회 실패 (${response.status})`,
        data: { likeCount: 0, isLiked: false },
      };
    }

    return await response.json();
  } catch (error) {
    console.error("좋아요 상태 조회 실패:", error);
    return {
      success: false,
      message: String(error),
      data: { likeCount: 0, isLiked: false },
    };
  }
};

/**
 * [GET] 내가 좋아요 누른 게시글 목록 조회
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
}

export const getLikedBoardsAPI = async (): Promise<LikedBoard[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pushedLikes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) return [];

    const result = await response.json();
    if (result.success) {
      const boards = result.data?.boards || [];
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
        };
      });
    }
    return [];
  } catch (error) {
    console.error("좋아요 게시글 목록 조회 실패:", error);
    return [];
  }
};