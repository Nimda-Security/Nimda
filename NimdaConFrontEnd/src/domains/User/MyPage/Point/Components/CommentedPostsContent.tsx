import React, { useState, useEffect } from 'react';
import { getMyCommentedBoardsAPI } from '@/api/board';
import type { MyBoard } from '@/api/board';
import ContentListItem from './ContentList/ContentListItem';
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

const CommentedPostsContent: React.FC = () => {
  const [boards, setBoards] = useState<MyBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoards = async () => {
      setLoading(true);
      const data = await getMyCommentedBoardsAPI();
      setBoards(data);
      setLoading(false);
    };
    fetchBoards();
  }, []);

  const totalPages = Math.ceil(boards.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedBoards = boards.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="py-12 text-center text-[#a3a3a3]">
        게시글을 불러오는 중...
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <div
        className="border border-[#d4d4d4] rounded-[4px] bg-[#f5f5f5] py-16 text-center text-[14px] text-[#a3a3a3]"
        style={{
          display: 'flex',
          width: '1136px',
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
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: '150%', // 24px
          }}
        >
          댓글을 작성한 게시글이 없습니다.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-6">
      <div className="border border-[#d4d4d4] rounded-[4px] bg-transparent overflow-hidden">
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
            }}
            checked={false}
            onToggle={() => {}}
            isLast={idx === displayedBoards.length - 1}
            onClick={() => navigate(`/board/view/${board.id}`)}
          />
        ))}
      </div>

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

export default CommentedPostsContent;
