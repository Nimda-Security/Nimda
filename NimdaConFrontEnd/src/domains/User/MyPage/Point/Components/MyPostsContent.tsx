import React, { useState, useEffect } from "react";
import { getMyBoardsAPI, deleteMyBoardsAPI } from "@/api/board";
import type { MyBoard } from "@/api/board";
import ContentListItem from "./ContentList/ContentListItem";
import ContentListActionBar from "./ContentList/ContentListActionBar";
import { useNavigate } from "react-router-dom";

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${month}.${day}`;
};

const MyPostsContent: React.FC = () => {
  const [boards, setBoards] = useState<MyBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoards = async () => {
      setLoading(true);
      const data = await getMyBoardsAPI();
      setBoards(data);
      setLoading(false);
    };
    fetchBoards();
  }, []);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === boards.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(boards.map((b) => b.id)));
    }
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const res = await deleteMyBoardsAPI(ids);
    if (res.success) {
      setBoards((prev) => prev.filter((b) => !selectedIds.has(b.id)));
      setSelectedIds(new Set());
    } else {
      alert(res.message);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-[#a3a3a3]">
        게시글을 불러오는 중...
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {boards.length > 0 ? (
        <div className="border border-[#d4d4d4] rounded-[4px] bg-transparent overflow-hidden">
          {boards.map((board, idx) => (
            <ContentListItem
              key={board.id}
              item={{
                id: board.id,
                text: board.title,
                likeCount: board.likeCount,
                commentCount: board.commentCount,
                date: formatDate(board.createdAt),
                thumbnailUrl: board.filepath || undefined,
              }}
              checked={selectedIds.has(board.id)}
              onToggle={() => toggleSelect(board.id)}
              isLast={idx === boards.length - 1}
              onClick={() => navigate(`/board/view/${board.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="border border-[#d4d4d4] rounded-[4px] bg-[#f5f5f5] py-16 text-center text-[14px] text-[#a3a3a3]">
          작성한 게시글이 없습니다.
        </div>
      )}

      <div className="h-[12px]" />

      {boards.length > 0 && (
        <div className="mt-[8px]">
          <ContentListActionBar
            allSelected={selectedIds.size === boards.length && boards.length > 0}
            onToggleAll={toggleAll}
            onDelete={handleDelete}
            hasSelected={selectedIds.size > 0}
          />
        </div>
      )}
    </div>
  );
};

export default MyPostsContent;
