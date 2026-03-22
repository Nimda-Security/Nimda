import React, { useState, useEffect } from "react";
import { getLikedBoardsAPI } from "@/api/boardLike";
import type { LikedBoard } from "@/api/boardLike";
import ContentListItem from "./ContentList/ContentListItem";

const LikedPostsContent: React.FC = () => {
  const [boards, setBoards] = useState<LikedBoard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await getLikedBoardsAPI();
      setBoards(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-[#a3a3a3]">
        게시글을 불러오는 중...
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <div className="border border-[#d4d4d4] rounded-[4px] bg-[#f5f5f5] py-16 text-center text-[14px] text-[#a3a3a3]">
        좋아요한 게시글이 없습니다.
      </div>
    );
  }

  return (
    <div className="border border-[#d4d4d4] rounded-[4px] bg-[#f5f5f5] overflow-hidden">
      {boards.map((board, idx) => (
        <ContentListItem
          key={board.id}
          item={{
            id: board.id,
            text: board.title,
            likeCount: board.likeCount ?? 0,
            date: board.createdAt ?? "",
          }}
          checked={false}
          onToggle={() => {}}
          isLast={idx === boards.length - 1}
        />
      ))}
    </div>
  );
};

export default LikedPostsContent;
