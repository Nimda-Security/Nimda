import React, { useState, useEffect } from 'react';
import { getMyCommentsAPI, deleteMyCommentsAPI } from '@/api/comment';
import type { MyComment } from '@/api/comment';
import ContentListItem from './ContentList/ContentListItem';
import ContentListActionBar from './ContentList/ContentListActionBar';
import Pagination from './ContentList/Pagination';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 8;

const MyCommentsContent: React.FC = () => {
  const [comments, setComments] = useState<MyComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await getMyCommentsAPI();
      setComments(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const totalPages = Math.ceil(comments.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedComments = comments.slice(startIdx, startIdx + ITEMS_PER_PAGE);

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
    if (selectedIds.size === 0 || isDeleting) return;
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    setIsDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      const res = await deleteMyCommentsAPI(ids);
      if (res.success) {
        setComments((prev) => prev.filter((c) => !selectedIds.has(c.id)));
        setSelectedIds(new Set());
        const newTotalPages = Math.ceil(
          (comments.length - ids.length) / ITEMS_PER_PAGE
        );
        if (currentPage > newTotalPages && newTotalPages > 0)
          setCurrentPage(newTotalPages);
      } else {
        alert(res.message);
      }
    } finally {
      setIsDeleting(false);
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
    <div className="flex flex-col w-full px-4">
      {comments.length > 0 ? (
        <div className="border border-[#d4d4d4] rounded-[4px] bg-[#f5f5f5] overflow-hidden">
          {displayedComments.map((comment, idx) => (
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
              isLast={idx === displayedComments.length - 1}
              onClick={() => navigate(`/board/view/${comment.boardId}`)}
              mode="checkbox"
            />
          ))}
        </div>
      ) : (
        <div
          className="border border-[#d4d4d4] rounded-[4px] bg-[#f5f5f5]"
          style={{
            display: 'flex',
            width: '100%',
            height: '360px',
            padding: '156px 0 180px 0',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto 146px auto', // 중앙 정렬 및 하단 푸터 간격 146px
            boxSizing: 'border-box',
          }}
        >
          <span
            style={{
              color: '#A3A3A3',
              textAlign: 'center',
              fontFamily: 'Pretendard',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '150%', // 24px
            }}
          >
            작성한 댓글이 없습니다.
          </span>
        </div>
      )}

      <div className="h-[12px]" />

      {comments.length > 0 && (
        <div className="mt-[8px]">
          <ContentListActionBar
            allSelected={
              selectedIds.size === comments.length && comments.length > 0
            }
            onToggleAll={toggleAll}
            onDelete={handleDelete}
            hasSelected={selectedIds.size > 0}
          />
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default MyCommentsContent;
