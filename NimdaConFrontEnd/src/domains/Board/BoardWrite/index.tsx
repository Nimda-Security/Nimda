import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { createBoardAPI } from '@/api/board';
import type { BoardType } from '../types';

function BoardWritePage() {
  const navigate = useNavigate();
  const { boardType: paramBoardType } = useParams<{ boardType: string }>();

  const boardType = (paramBoardType?.toUpperCase() || 'NEWS') as BoardType;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await createBoardAPI({
        boardType,
        title: title.trim(),
        content: content.trim(),
        file: file || undefined,
      });

      if (response.success && 'board' in response) {
        alert('게시글이 작성되었습니다.');
        navigate(`/board/${boardType.toLowerCase()}/${response.board.id}`);
      } else {
        setError(response.message || '게시글 작성에 실패했습니다.');
      }
    } catch (err) {
      setError('게시글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 사라집니다. 정말 나가시겠습니까?')) {
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

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-8">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <header className="mb-6">
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-black text-sm mb-4"
            >
              ← 목록으로 돌아가기
            </button>
            <h1 className="text-2xl font-bold text-black">게시글 작성</h1>
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
                {isSubmitting ? '작성 중...' : '작성하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default BoardWritePage;

