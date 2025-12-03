import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { getBoardDetailAPI, updateBoardAPI } from '@/api/board';
import type { Board, BoardType } from '../types';

function BoardEditPage() {
  const navigate = useNavigate();
  const { boardType: paramBoardType, id } = useParams<{ boardType: string; id: string }>();

  const boardType = (paramBoardType?.toUpperCase() || 'NEWS') as BoardType;

  const [board, setBoard] = useState<Board | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const fetchedBoard = response.board;
        setBoard(fetchedBoard);
        setTitle(fetchedBoard.title);
        setContent(fetchedBoard.content);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!board || !title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await updateBoardAPI(board.id, {
        boardType,
        title: title.trim(),
        content: content.trim(),
        file: file || undefined,
      });

      if (response.success && 'board' in response) {
        alert('게시글이 수정되었습니다.');
        navigate(`/board/${boardType.toLowerCase()}/${board.id}`);
      } else {
        setError(response.message || '게시글 수정에 실패했습니다.');
      }
    } catch (err) {
      setError('게시글 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (board) {
      navigate(`/board/${boardType.toLowerCase()}/${board.id}`);
    } else {
      navigate(`/board/${boardType.toLowerCase()}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white pt-8">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="text-center py-12 text-gray-600">로딩 중...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !board) {
    return (
      <Layout>
        <div className="min-h-screen bg-white pt-8">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="text-center py-12 text-red-600">{error}</div>
            <div className="text-center">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                돌아가기
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
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <header className="mb-6">
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-black text-sm mb-4"
            >
              ← 돌아가기
            </button>
            <h1 className="text-2xl font-bold text-black">게시글 수정</h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                maxLength={200}
                required
              />
            </div>

            {/* 내용 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                내용
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black resize-none"
                required
              />
            </div>

            {/* 파일 업로드 */}
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                첨부파일
                {board?.filename && (
                  <span className="text-sm text-gray-500 ml-2">
                    (현재: {board.filename.split('_').slice(1).join('_')})
                  </span>
                )}
              </label>
              {file ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    삭제
                  </button>
                </div>
              ) : (
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              )}
              <p className="text-xs text-gray-500 mt-1">
                새 파일을 업로드하면 기존 파일이 교체됩니다.
              </p>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded">{error}</div>
            )}

            {/* 버튼 */}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? '수정 중...' : '수정하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default BoardEditPage;

