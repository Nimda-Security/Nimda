import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { getBoardListAPI, getPinnedPostsAPI } from '@/api/board';
import { getAllCategoriesAPI } from '@/api/category';
import type { Board, Category } from '../types';
import { CATEGORY_LABELS } from '../constants';
import './BoardList.css';

interface BoardListPageProps {
  slug?: string;
}

/**
 * 날짜 포맷팅
 * - 오늘: "15:38"
 * - 올해: "02.20"
 * - 작년 이전: "25.12.31"
 */
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isThisYear = date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  if (isThisYear) {
    return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  }
  return `${String(date.getFullYear()).slice(2)}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

function BoardListPage({ slug: propSlug }: BoardListPageProps) {
  const navigate = useNavigate();
  const { boardType: paramBoardType } = useParams<{ boardType: string }>();
  const [searchParams] = useSearchParams();

  const slug = propSlug || paramBoardType?.toLowerCase() || 'news';
  const tabFromUrl = searchParams.get('tab'); // ?tab=xxx 쿼리 파라미터

  const [boards, setBoards] = useState<Board[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<Board[]>([]);
  const [noticePosts, setNoticePosts] = useState<Board[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  // 검색 실행 트리거 (검색 버튼 클릭 시 증가)
  const [searchTrigger, setSearchTrigger] = useState(0);

  // 공지사항(필독) 가져오기 - notice 카테고리의 글 (컴포넌트 마운트 시 1회)
  useEffect(() => {
    let cancelled = false;
    const fetchNotice = async () => {
      try {
        const pinnedResponse = await getPinnedPostsAPI(undefined, 'notice', 5);
        if (cancelled) return;
        if (pinnedResponse.success && pinnedResponse.posts.length > 0) {
          setNoticePosts(pinnedResponse.posts);
          return;
        }
        const listResponse = await getBoardListAPI({
          slug: 'notice',
          page: 0,
          size: 5,
          sort: 'createdAt,desc',
        });
        if (cancelled) return;
        if (listResponse.success && listResponse.posts.length > 0) {
          setNoticePosts(listResponse.posts);
        }
      } catch {
        // 공지사항 조회 실패해도 무시
      }
    };
    fetchNotice();
    return () => { cancelled = true; };
  }, []);

  // slug 변경 시: 카테고리 정보 + 하위 카테고리 로딩, 상태 초기화
  useEffect(() => {
    let cancelled = false;
    // 상태 초기화
    setCategory(null);
    setChildCategories([]);
    setActiveTab(tabFromUrl || 'all');
    setCurrentPage(0);
    setSearchKeyword('');

    const loadCategoryInfo = async () => {
      try {
        const [catInfoResponse, allCategories] = await Promise.all([
          getBoardListAPI({ slug, page: 0, size: 1, sort: 'createdAt,desc' }),
          getAllCategoriesAPI(),
        ]);
        if (cancelled) return;
        if (catInfoResponse.success && catInfoResponse.category?.id) {
          setCategory(catInfoResponse.category);
          const children = allCategories
            .filter(c => c.parentId === catInfoResponse.category.id)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          setChildCategories(children);
        }
      } catch {
        // 카테고리 정보 로딩 실패해도 무시
      }
    };
    loadCategoryInfo();
    return () => { cancelled = true; };
  }, [slug, tabFromUrl]);

  // 게시글 목록 불러오기 (slug, activeTab, currentPage, searchKeyword 변경 시)
  useEffect(() => {
    let cancelled = false;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const targetSlug = activeTab === 'all' ? slug : activeTab;

        const response = await getBoardListAPI({
          slug: targetSlug,
          searchKeyword: searchKeyword || undefined,
          page: currentPage,
          size: 20,
          sort: 'createdAt,desc',
          includeChildren: activeTab === 'all' || undefined,
        });

        if (cancelled) return;

        if (response.success) {
          const pinned = response.posts.filter(p => p.pinned);
          const regular = response.posts.filter(p => !p.pinned);
          setPinnedPosts(pinned);
          setBoards(regular);
          setTotalPages(response.totalPages);
          if (activeTab === 'all' && response.category?.id) {
            setCategory(response.category);
          }
        } else {
          setError(response.message);
          setBoards([]);
          setPinnedPosts([]);
        }
      } catch {
        if (!cancelled) {
          setError('게시글 목록을 불러오는 중 오류가 발생했습니다.');
          setBoards([]);
          setPinnedPosts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPosts();
    return () => { cancelled = true; };
  }, [slug, activeTab, currentPage, searchTrigger]);

  const handleBoardClick = (id: number) => {
    navigate(`/board/${slug}/${id}`);
  };

  const handleWriteClick = () => {
    navigate(`/board/${slug}/write`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabClick = (tabSlug: string) => {
    setActiveTab(tabSlug);
    setCurrentPage(0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    setSearchTrigger(prev => prev + 1);
  };

  const categoryName = category?.name || CATEGORY_LABELS[slug] || '게시판';

  // 공지사항: notice 카테고리의 고정글 + 현재 카테고리의 고정글 (중복 제거)
  const allPinnedIds = new Set(pinnedPosts.map(p => p.id));
  const globalNotices = noticePosts.filter(p => !allPinnedIds.has(p.id));
  // 현재 카테고리가 notice 자체라면 globalNotices 비우기
  const isNoticeCategory = slug === 'notice';
  const displayGlobalNotices = isNoticeCategory ? [] : globalNotices;

  // 페이지 번호 렌더링용
  const renderPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <Layout>
      <div className="board-list">
        {/* 헤더: 제목 + 글쓰기 버튼 */}
        <div className="board-list__header">
          <h1 className="board-list__title">{categoryName}</h1>
          <button className="board-list__write-btn" onClick={handleWriteClick}>
            글쓰기
          </button>
        </div>

        {/* 말머리 탭 */}
        {childCategories.length > 0 && (
          <div className="board-list__tabs">
            <button
              className={`board-list__tab ${activeTab === 'all' ? 'board-list__tab--active' : ''}`}
              onClick={() => handleTabClick('all')}
            >
              전체
            </button>
            {childCategories.map(child => (
              <button
                key={child.id}
                className={`board-list__tab ${activeTab === child.slug ? 'board-list__tab--active' : ''}`}
                onClick={() => handleTabClick(child.slug)}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}

        {/* 구분선 */}
        <div className="board-list__divider" />

        {/* 로딩 */}
        {loading && <div className="board-list__status">로딩 중...</div>}

        {/* 에러 */}
        {error && <div className="board-list__status board-list__status--error">{error}</div>}

        {!loading && !error && (
          <>
            {/* ===== 글로벌 공지 (notice 카테고리 고정글) - "필독", 핑크 배경 ===== */}
            {displayGlobalNotices.map(post => (
              <div
                key={`notice-${post.id}`}
                className="board-list__row board-list__row--pinned"
                onClick={() => navigate(`/board/notice/${post.id}`)}
              >
                <span className="board-list__tag board-list__tag--red">필독</span>
                <span className="board-list__post-title board-list__post-title--bold">
                  {post.title}
                </span>
                <div className="board-list__meta">
                  <span className="board-list__author">{post.author?.nickname || '익명'}</span>
                  <span className="board-list__date">{formatDate(post.createdAt)}</span>
                </div>
                <div className="board-list__row-divider" />
              </div>
            ))}

            {/* ===== 현재 카테고리 고정글 - "공지", 회색 배경 ===== */}
            {pinnedPosts.map(post => (
              <div
                key={`pinned-${post.id}`}
                className="board-list__row board-list__row--notice"
                onClick={() => handleBoardClick(post.id)}
              >
                <span className="board-list__tag board-list__tag--notice">공지</span>
                <span className="board-list__post-title board-list__post-title--bold">
                  {post.title}
                </span>
                <div className="board-list__meta">
                  <span className="board-list__author">{post.author?.nickname || '익명'}</span>
                  <span className="board-list__date">{formatDate(post.createdAt)}</span>
                </div>
                <div className="board-list__row-divider" />
              </div>
            ))}

            {/* 고정글과 일반글 사이 구분 */}

            {/* ===== 일반 게시글 ===== */}
            {boards.length === 0 && pinnedPosts.length === 0 && displayGlobalNotices.length === 0 ? (
              <div className="board-list__status">게시글이 없습니다.</div>
            ) : (
              boards.map(post => (
                <div
                  key={post.id}
                  className="board-list__row"
                  onClick={() => handleBoardClick(post.id)}
                >
                  {/* 카테고리 태그 (하위 카테고리 정보 표시) */}
                  {post.category && post.category.name && activeTab === 'all' && childCategories.length > 0 && (
                    <span className="board-list__tag board-list__tag--gray">
                      {post.category.name.length > 4
                        ? post.category.name.slice(0, 4)
                        : post.category.name}
                    </span>
                  )}
                  <span className="board-list__post-title">{post.title}</span>
                  <div className="board-list__meta">
                    <span className="board-list__author">{post.author?.nickname || '익명'}</span>
                    {post.views > 0 && (
                      <span className="board-list__views">조회 {post.views}</span>
                    )}
                    <span className="board-list__date">{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="board-list__row-divider" />
                </div>
              ))
            )}

            {/* ===== 페이지네이션 ===== */}
            {totalPages > 1 && (
              <div className="board-list__pagination">
                <button
                  className="board-list__page-btn"
                  onClick={() => handlePageChange(0)}
                  disabled={currentPage === 0}
                  title="첫 페이지"
                >
                  «
                </button>
                <button
                  className="board-list__page-btn"
                  onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  title="이전 페이지"
                >
                  ‹
                </button>
                {renderPageNumbers().map(page => (
                  <button
                    key={page}
                    className={`board-list__page-num ${page === currentPage ? 'board-list__page-num--active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page + 1}
                  </button>
                ))}
                <button
                  className="board-list__page-btn"
                  onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                  title="다음 페이지"
                >
                  ›
                </button>
                <button
                  className="board-list__page-btn"
                  onClick={() => handlePageChange(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
                  title="마지막 페이지"
                >
                  »
                </button>
              </div>
            )}

            {/* ===== 검색 ===== */}
            <form className="board-list__search" onSubmit={handleSearch}>
              <input
                type="text"
                className="board-list__search-input"
                placeholder="검색어를 입력하세요"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <button type="submit" className="board-list__search-btn">
                검색
              </button>
            </form>
          </>
        )}
      </div>
    </Layout>
  );
}

export default BoardListPage;
