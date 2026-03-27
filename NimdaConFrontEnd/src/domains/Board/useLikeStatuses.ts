import { useState, useEffect } from "react";
import type { Board } from "@/domains/Board/types";
import { getBoardLikeStatus } from "@/api/boardLike";

export const useLikeStatuses = (posts: Board[]) => {
  const [likeStatuses, setLikeStatuses] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (posts.length === 0) return;
    const fetchLikes = async () => {
      const likeMap: Record<number, boolean> = {};
      await Promise.all(
        posts.map(async (post) => {
          try {
            const likeRes = await getBoardLikeStatus(post.id);
            likeMap[post.id] = likeRes.data?.isLiked ?? false;
          } catch {
            likeMap[post.id] = false;
          }
        })
      );
      setLikeStatuses(likeMap);
    };
    fetchLikes();
  }, [posts]);

  return likeStatuses;
};