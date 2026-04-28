import React, { useState, useEffect } from 'react';
import { getMyBoardsAPI, deleteMyBoardsAPI } from '@/api/board';
import type { MyBoard } from '@/api/board';
import ContentListItem from './ContentList/ContentListItem';
import ContentListActionBar from './ContentList/ContentListActionBar';
import Pagination from './ContentList/Pagination';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 8;

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${month}.${day}`;
};

const MyPostsContent: React.FC = () => {
  const [boards, setBoards] = useState<MyBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const totalPages = Math.ceil(boards.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedBoards = boards.slice(startIdx, startIdx + ITEMS_PER_PAGE);

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
    if (selectedIds.size === 0 || isDeleting) return;
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    setIsDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      const res = await deleteMyBoardsAPI(ids);
      if (res.success) {
        setBoards((prev) => prev.filter((b) => !selectedIds.has(b.id)));
        setSelectedIds(new Set());
        const newTotalPages = Math.ceil(
          (boards.length - ids.length) / ITEMS_PER_PAGE
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
        게시글을 불러오는 중...
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-6">
      {boards.length > 0 ? (
        <div
          className="border border-[#d4d4d4] rounded-[4px] bg-[#f5f5f5]"
          style={{
            padding: '0',
            boxSizing: 'border-box',
          }}
        >
          <div className="overflow-hidden">
            {displayedBoards.map((board, idx) => (
              <ContentListItem
                key={board.id}
                item={{
                  id: board.id,
                  text: board.title,
                  likeCount: board.likeCount,
                  commentCount: board.commentCount,
                  date: formatDate(board.createdAt),
                  thumbnailUrl: board.filepath || undefined,
                  authorNickname: board.authorNickname,
                  authorProfileImage: board.authorProfileImage,
                  authorProfileDecoration: board.authorProfileDecoration,
                }}
                checked={selectedIds.has(board.id)}
                onToggle={() => toggleSelect(board.id)}
                isLast={idx === displayedBoards.length - 1}
                onClick={() => navigate(`/board/view/${board.id}`)}
                mode="checkbox"
              />
            ))}
          </div>
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
            margin: '0 auto 146px auto',
            boxSizing: 'border-box',
          }}
        >
          <span
            style={{
              color: '#A3A3A3',
              textAlign: 'center',
              fontFamily: 'Pretendard',
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: '150%',
            }}
          >
            작성한 게시글이 없습니다.
          </span>
        </div>
      )}

      <div className="h-[12px]" />

      {boards.length > 0 && (
        <div className="mt-[8px]">
          <ContentListActionBar
            allSelected={
              selectedIds.size === boards.length && boards.length > 0
            }
            onToggleAll={toggleAll}
            onDelete={handleDelete}
            hasSelected={selectedIds.size > 0}
          />
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        <div className="h-[24px] w-full" aria-hidden="true" />
      </div>
    </div>
  );
};

export default MyPostsContent;
