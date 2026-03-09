import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { createBoardAPI } from '@/api/board';
import { getCategoryBySlugAPI, getAllCategoriesAPI } from '@/api/category';
import type { Category } from '../types';

function BoardWritePage() {
  const navigate = useNavigate();
  const { boardType: paramBoardType } = useParams<{ boardType: string }>();
  const [searchParams] = useSearchParams();

  const slug = paramBoardType?.toLowerCase() || 'news';
  const tagFromUrl = searchParams.get('tag'); // URL 쿼리 파라미터에서 태그 가져오기

  const [category, setCategory] = useState<Category | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모든 카테고리 목록 가져오기
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const categories = await getAllCategoriesAPI();
        setAllCategories(categories);
      } catch (err) {
        console.error('카테고리 목록 로드 오류:', err);
      }
    };
    fetchAllCategories();
  }, []);

  // URL slug로 카테고리 자동 선택
  useEffect(() => {
    const fetchCategory = async () => {
      const categoryData = await getCategoryBySlugAPI(slug);
      if (categoryData) {
        setCategory(categoryData);
        setSelectedCategoryId(categoryData.id);
      }
    };
    fetchCategory();
  }, [slug]);

  // URL에서 태그 자동 선택 (카테고리가 로드된 후)
  useEffect(() => {
    if (tagFromUrl && category) {
      const availableTags = getAvailableTags(category);
      if (availableTags.includes(tagFromUrl)) {
        setTag(tagFromUrl);
      }
    } else if (!tagFromUrl) {
      // URL에 태그가 없으면 초기화
      setTag('');
    }
  }, [tagFromUrl, category]);

  // 선택된 카테고리 변경 시 해당 카테고리 정보 업데이트
  useEffect(() => {
    if (selectedCategoryId) {
      const selectedCategory = allCategories.find(cat => cat.id === selectedCategoryId);
      if (selectedCategory) {
        setCategory(selectedCategory);
        // 카테고리 변경 시 태그 초기화 (새 카테고리의 태그 목록에 없을 수 있음)
        const availableTags = getAvailableTags(selectedCategory);
        if (tag && !availableTags.includes(tag)) {
          setTag('');
        }
      }
    }
  }, [selectedCategoryId, allCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    if (!selectedCategoryId) {
      setError('카테고리를 선택해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await createBoardAPI({
        categoryId: selectedCategoryId,
        title: title.trim(),
        content: content.trim(),
        tag: tag.trim() || undefined,
        file: file || undefined,
      });

      if (response.success && 'board' in response) {
        alert('게시글이 작성되었습니다.');
        // 작성된 게시글의 카테고리 slug로 이동
        const writtenCategory = allCategories.find(cat => cat.id === selectedCategoryId);
        const categorySlug = writtenCategory?.slug || slug;
        navigate(`/board/${categorySlug}/${response.board.id}`);
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
      navigate(`/board/${slug}`);
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

  // 카테고리의 availableTags를 파싱하여 배열로 변환
  const getAvailableTags = (cat?: Category | null): string[] => {
    const targetCategory = cat || category;
    if (!targetCategory?.availableTags) return [];
    try {
      return JSON.parse(targetCategory.availableTags);
    } catch {
      return [];
    }
  };

  const availableTags = getAvailableTags();

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
            {/* 카테고리 선택 */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                id="category"
                value={selectedCategoryId || ''}
                onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                required
              >
                <option value="">카테고리를 선택하세요</option>
                {allCategories
                  .filter(cat => cat.isActive)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

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

            {/* 태그 선택 (카테고리에 availableTags가 있을 때만 표시) */}
            {availableTags.length > 0 && (
              <div>
                <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-2">
                  세부 카테고리 (선택사항)
                </label>
                <select
                  id="tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">세부 카테고리를 선택하세요</option>
                  {availableTags.map((tagOption) => (
                    <option key={tagOption} value={tagOption}>
                      {tagOption}
                    </option>
                  ))}
                </select>
              </div>
            )}

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

