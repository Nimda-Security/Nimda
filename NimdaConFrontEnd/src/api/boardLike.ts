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
const authToken = localStorage.getItem("authToken");
const response = await fetch(`${API_BASE_URL}/pushedLikes/count`, {
method: "GET",
headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${authToken}`,
},
});

if (!response.ok) return 0;

    const result = await response.json();

    // 💡 [수정] result.data?.count를 result.data?.likeCount로 변경
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
  const authToken = localStorage.getItem("authToken");
  const response = await fetch(`${API_BASE_URL}/${boardId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${authToken}`,
    },
  });
  return await response.json();
};

/**
 * [GET] 특정 게시글의 좋아요 상태 및 개수 확인
 */
export const getBoardLikeStatus = async (boardId: number): Promise<BoardLikeResponse> => {
  const authToken = localStorage.getItem("authToken");
  const response = await fetch(`${API_BASE_URL}/${boardId}/likeStatus`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${authToken}`,
    },
  });
  return await response.json();
};