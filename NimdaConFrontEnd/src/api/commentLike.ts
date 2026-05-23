const API_BASE_URL = "/api/like/comment";

import { addVersionToHeaders } from '../constants/version';

export interface CommentLikeResponse {
  success: boolean;
  message: string;
  data: {
    likeCount: number;
    isLiked: boolean;
  };
}

/**
 * [POST] 댓글 좋아요 토글
 * 백엔드: @PostMapping("/{commentId}")
 */
export const toggleCommentLike = async (commentId: number): Promise<CommentLikeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${commentId}`, {
      method: "POST",
      headers: addVersionToHeaders({
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      console.error(`API 호출 실패 (${response.status}):`, await response.text());
      return {
        success: false,
        message: `댓글 좋아요 토글 실패 (${response.status})`,
        data: { likeCount: 0, isLiked: false },
      };
    }

    return await response.json();
  } catch (error) {
    console.error("댓글 좋아요 토글 실패:", error);
    return {
      success: false,
      message: String(error),
      data: { likeCount: 0, isLiked: false },
    };
  }
};

/**
 * [GET] 특정 댓글의 좋아요 개수 조회
 * 백엔드: @GetMapping("/{commentId}/likeCount")
 */
export const getCommentLikeCount = async (commentId: number): Promise<CommentLikeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${commentId}/likeCount`, {
      method: "GET",
      headers: addVersionToHeaders({
        "Content-Type": "application/json",
      }),
    });

    if (!response.ok) {
      console.error(`API 호출 실패 (${response.status}):`, await response.text());
      return {
        success: false,
        message: `댓글 좋아요 개수 조회 실패 (${response.status})`,
        data: { likeCount: 0, isLiked: false },
      };
    }

    return await response.json();
  } catch (error) {
    console.error("댓글 좋아요 개수 조회 실패:", error);
    return {
      success: false,
      message: String(error),
      data: { likeCount: 0, isLiked: false },
    };
  }
};