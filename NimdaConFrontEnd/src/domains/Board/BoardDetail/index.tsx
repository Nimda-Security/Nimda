import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { getBoardDetailAPI, deleteBoardAPI, getFileDownloadURL } from '@/api/board';
import type { Board } from '../types';

function BoardDetailPage() {
  const navigate = useNavigate();
  const { boardType, id } = useParams<{ boardType: string; id: string }>();

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBoard(parseInt(id));
    }
  }, [id]);

  const fetchBoard = async (boardId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBoardDetailAPI(boardId);

      if (response.success && 'board' in response) {
        setBoard(response.board);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (board?.category?.slug) {
      navigate(`/board/${board.category.slug}`);
    } else if (boardType) {
      navigate(`/board/${boardType}`);
    } else {
      navigate('/');
    }
  };

  const handleEdit = () => {
    if (board) {
      const slug = board.category?.slug || boardType;
      navigate(`/board/${slug}/edit/${board.id}`);
    }
  };

  const handleDelete = async () => {
    if (!board || !window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await deleteBoardAPI(board.id);

      if (response.success) {
        alert('게시글이 삭제되었습니다.');
        handleGoBack();
      } else {
        alert(response.message || '게시글 삭제에 실패했습니다.');
      }
    } catch (err) {
      alert('게시글 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileDownload = () => {
    if (board?.filepath) {
      const downloadURL = getFileDownloadURL(board.filepath);
      if (downloadURL) {
        window.open(downloadURL, '_blank');
      }
    }
  };

  // 작성자 확인 (수정/삭제 버튼 표시용)
  const isAuthor = () => {
    if (!board) return false;
    // TODO: 현재 로그인한 사용자와 비교
    return false;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white pt-8">
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            <div className="text-center py-12 text-gray-600">로딩 중...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !board) {
    return (
      <Layout>
        <div className="min-h-screen bg-white pt-8">
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            <div className="text-center py-12 text-red-600">
              {error || '게시글을 찾을 수 없습니다.'}
            </div>
            <div className="text-center">
              <button
                onClick={handleGoBack}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                목록으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-8">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* 헤더 */}
          <header className="mb-6">
            <button
              onClick={handleGoBack}
              className="text-gray-600 hover:text-black text-sm mb-4"
            >
              ← 목록으로 돌아가기
            </button>
            <h1 className="text-2xl font-bold text-black mb-2">{board.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{board.author.nickname}</span>
              <span>{new Date(board.createdAt).toLocaleString()}</span>
              <span>조회 {board.views}</span>
              {board.filename && (
                <button
                  onClick={handleFileDownload}
                  className="text-blue-600 hover:underline"
                >
                  📎 {board.filename.split('_').slice(1).join('_')}
                </button>
              )}
            </div>
          </header>

          {/* 본문 */}
          <main className="mb-8">
            <div className="prose max-w-none whitespace-pre-wrap">
              {board.content}
            </div>
          </main>

          {/* 액션 버튼 */}
          {isAuthor() && (
            <footer className="flex gap-2 pt-4 border-t">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </footer>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default BoardDetailPage;

