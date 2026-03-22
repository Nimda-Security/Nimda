import React, { useState, useEffect } from "react";
import { getMyCommentsAPI, deleteMyCommentsAPI } from "@/api/comment";
import type { MyComment } from "@/api/comment";
import ContentListItem from "./ContentList/ContentListItem";
import ContentListActionBar from "./ContentList/ContentListActionBar";

const MyCommentsContent: React.FC = () => {
  const [comments, setComments] = useState<MyComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await getMyCommentsAPI();
      setComments(data);
      setLoading(false);
    };
    fetch();
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
    if (selectedIds.size === comments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(comments.map((c) => c.id)));
    }
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const res = await deleteMyCommentsAPI(ids);
    if (res.success) {
      setComments((prev) => prev.filter((c) => !selectedIds.has(c.id)));
      setSelectedIds(new Set());
    } else {
      alert(res.message);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-[#a3a3a3]">
        댓글을 불러오는 중...
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* 댓글 리스트: 여백 수정을 위해 gap 대신 mt 사용 */}
      {comments.length > 0 ? (
        <div className="border border-[#d4d4d4] rounded-[4px] bg-transparent overflow-hidden">
          {comments.map((comment, idx) => (
            <ContentListItem
              key={comment.id}
              item={{
                id: comment.id,
                text: comment.context,
                likeCount: comment.likeCount,
                date: comment.createdAt,
              }}
              checked={selectedIds.has(comment.id)}
              onToggle={() => toggleSelect(comment.id)}
              isLast={idx === comments.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="border border-[#d4d4d4] rounded-[4px] bg-[#f5f5f5] py-16 text-center text-[14px] text-[#a3a3a3]">
          작성한 댓글이 없습니다.
        </div>
      )}

        <div className="h-[12px]" />

      {/* 전체선택 / 삭제: 리스트 바로 아래 mt-2 간격 부여 */}
      {comments.length > 0 && (
        <div className="mt-[8px]">
          <ContentListActionBar
            allSelected={selectedIds.size === comments.length && comments.length > 0}
            onToggleAll={toggleAll}
            onDelete={handleDelete}
            hasSelected={selectedIds.size > 0}
          />
        </div>
      )}
    </div>
  );
};

export default MyCommentsContent;