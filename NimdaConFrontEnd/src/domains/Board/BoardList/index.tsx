import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { getBoardListAPI } from '@/api/board';
import type { Board, BoardType } from '../types';
import { BOARD_TYPE_LABELS } from '../constants';

interface BoardListPageProps {
  boardType?: BoardType;
}

function BoardListPage({ boardType: propBoardType }: BoardListPageProps) {
  const navigate = useNavigate();
  const { boardType: paramBoardType } = useParams<{ boardType: string }>();
  
  // props나 URL 파라미터에서 boardType 가져오기
  const boardType = (propBoardType || paramBoardType?.toUpperCase() || 'NEWS') as BoardType;
  
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchBoards();
  }, [boardType, currentPage, searchKeyword]);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getBoardListAPI({
        boardType,
        searchKeyword: searchKeyword || undefined,
        page: currentPage,
        size: 10,
        sort: 'createdAt,desc',
      });

      if (response.success) {
        setBoards(response.posts);
        setTotalPages(response.totalPages);
      } else {
        setError(response.message);
        setBoards([]);
      }
    } catch (err) {
      setError('게시글 목록을 불러오는 중 오류가 발생했습니다.');
      setBoards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchBoards();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBoardClick = (id: number) => {
    navigate(`/board/${boardType.toLowerCase()}/${id}`);
  };

  const handleWriteClick = () => {
    navigate(`/board/${boardType.toLowerCase()}/write`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-8">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* 헤더 */}
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-black">
                {BOARD_TYPE_LABELS[boardType]}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                총 {boards.length}개의 게시글
              </p>
            </div>
            <button
              onClick={handleWriteClick}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              글쓰기
            </button>
          </header>

          {/* 검색 */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="검색어를 입력하세요..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-black transition"
              >
                검색
              </button>
            </div>
          </form>

          {/* 게시글 목록 */}
          <main className="min-h-[200px]">
            {loading && (
              <div className="text-center py-12 text-gray-600">로딩 중...</div>
            )}

            {error && (
              <div className="text-center py-12 text-red-600">{error}</div>
            )}

            {!loading && !error && (
              <div className="space-y-4">
                {boards.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    게시글이 없습니다.
                  </div>
                ) : (
                  boards.map((board) => (
                    <div
                      key={board.id}
                      onClick={() => handleBoardClick(board.id)}
                      className="p-4 border border-gray-200 rounded hover:border-black hover:shadow-md transition cursor-pointer"
                    >
                      <h3 className="text-lg font-semibold text-black mb-2">
                        {board.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{board.author.nickname}</span>
                        <span>{new Date(board.createdAt).toLocaleDateString()}</span>
                        {board.filename && (
                          <span className="text-blue-600">📎 첨부파일</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </main>

          {/* 페이지네이션 */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded ${
                    page === currentPage
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default BoardListPage;

