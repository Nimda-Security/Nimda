import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { getBoardListAPI, getPinnedPostsAPI } from '@/api/board';
import { getAllCategoriesAPI } from '@/api/category';
import type { Board, Category } from '../types';
import { CATEGORY_LABELS } from '../constants';
import { Heart } from '@/components/icons/Heart';
import { MessageBox } from '@/components/icons/MessageBox';
import { isAdmin, hasRole } from '@/utils/jwt';
import { formatDate } from '@/utils/formatDate';
import './BoardList.css';
import Avatar from '@/components/Avatar/Avatar';

interface BoardListPageProps {
  slug?: string;
}

function BoardListPage({ slug: propSlug }: BoardListPageProps) {
  const navigate = useNavigate();
  const { boardType: paramBoardType } = useParams<{ boardType: string }>();
  const [searchParams] = useSearchParams();

  const slug = propSlug || paramBoardType?.toLowerCase() || 'news';
  const tabFromUrl = searchParams.get('tab');

  const [boards, setBoards] = useState<Board[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<Board[]>([]);
  const [noticePosts, setNoticePosts] = useState<Board[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // ★ 해결 포인트 1: 의존성 배열의 참조값 고정
  // boards나 pinnedPosts가 실제로 변하지 않으면 새로운 배열을 만들지 않음
  const allPostsForLikes = useMemo(() => {
    return [...noticePosts, ...pinnedPosts, ...boards];
  }, [noticePosts, pinnedPosts, boards]);

  // 공지사항 로딩 (최초 1회)
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
        /* ignore */
      }
    };
    fetchNotice();
    return () => { cancelled = true; };
  }, []);

  // 카테고리 정보 로딩
  useEffect(() => {
    let cancelled = false;
    setCategory(null);
    setChildCategories([]);
    setActiveTab(tabFromUrl || 'all');
    setCurrentPage(0);
    setSearchKeyword('');
    setSelectedTag(null);

    const loadCategoryInfo = async () => {
      try {
        const [catInfoResponse, allCats] = await Promise.all([
          getBoardListAPI({ slug, page: 0, size: 1, sort: 'createdAt,desc' }),
          getAllCategoriesAPI(),
        ]);
        if (cancelled) return;
        setAllCategories(allCats);
        if (catInfoResponse.success && catInfoResponse.category?.id) {
          setCategory(catInfoResponse.category);
          const children = allCats
            .filter((c) => c.parentId === catInfoResponse.category.id)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          setChildCategories(children);
        }
      } catch {
        /* ignore */
      }
    };
    loadCategoryInfo();
    return () => { cancelled = true; };
  }, [slug, tabFromUrl]);

  // 태그 목록 수집
  useEffect(() => {
    const collectTags = () => {
      const tagSet = new Set<string>();
      if (childCategories.length > 0) {
        childCategories.forEach((cat) => {
          if (cat.availableTags) {
            try {
              const tags = JSON.parse(cat.availableTags);
              if (Array.isArray(tags)) tags.forEach((tag: string) => tagSet.add(tag));
            } catch { /* ignore */ }
          }
        });
      } else if (category?.availableTags) {
        try {
          const tags = JSON.parse(category.availableTags);
          if (Array.isArray(tags)) tags.forEach((tag: string) => tagSet.add(tag));
        } catch { /* ignore */ }
      }

      const newTags = Array.from(tagSet).sort();
      // 불필요한 상태 업데이트 방지 (내용이 같으면 업데이트 안 함)
      setAvailableTags(prev => JSON.stringify(prev) === JSON.stringify(newTags) ? prev : newTags);
    };
    collectTags();
  }, [category, childCategories]);

  // 게시글 목록 불러오기
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
          let filteredPosts = response.posts;
          if (selectedTag !== null) {
            filteredPosts = response.posts.filter((p) => p.tag === selectedTag);
          }

          const pinned = filteredPosts.filter((p) => p.pinned);
          const regular = filteredPosts.filter((p) => !p.pinned);

          setPinnedPosts(pinned);
          setBoards(regular);
          setTotalPages(response.totalPages);

          // ★ 해결 포인트 2: ID 비교를 통한 무한 루프 방지
          if (activeTab === 'all' && response.category?.id) {
            setCategory(prev => (prev?.id === response.category.id ? prev : response.category));
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
  }, [slug, activeTab, currentPage, searchTrigger, selectedTag]);

  // 핸들러 함수들
  const handleBoardClick = (id: number) => navigate(`/board/${slug}/${id}`);
  const handleWriteClick = () => {
    const tagParam = selectedTag ? `?tag=${encodeURIComponent(selectedTag)}` : '';
    navigate(`/board/${slug}/write${tagParam}`);
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
    setSearchTrigger((prev) => prev + 1);
  };
  const handleTagClick = (tag: string | null) => {
    setSelectedTag(tag);
    setCurrentPage(0);
  };

  // 렌더링용 변수들
  const categoryName = category?.name || CATEGORY_LABELS[slug] || '게시판';
  const getCategoryTagLabel = (post: Board, fallbackLabel?: string) => {
    if (post.tag) return `# ${post.tag}`;
    if (fallbackLabel) return `# ${fallbackLabel}`;
    if (post.category?.name) return `# ${post.category.name}`;
    return '# 게시물';
  };

  const isNewsCategoryGroup = useMemo(() => {
    if (!category) return slug === 'news';
    if (category.name === '새 소식') return true;
    if (category.parentId) {
      const parent = allCategories.find((c) => c.id === category.parentId);
      return parent?.name === '새 소식';
    }
    return false;
  }, [category, slug, allCategories]);

  const canWrite = !isNewsCategoryGroup || isAdmin();

  const isCartelCategoryGroup = useMemo(() => {
    if (!category) return false;
    if (category.name === '카르텔') return true;
    if (category.parentId) {
      const parent = allCategories.find((c) => c.id === category.parentId);
      return parent?.name === '카르텔';
    }
    return false;
  }, [category, allCategories]);

  useEffect(() => {
    if (isCartelCategoryGroup && !hasRole('ROLE_CARTEL') && !isAdmin()) {
      alert('접근 권한이 없습니다.');
      navigate('/');
    }
  }, [isCartelCategoryGroup, navigate]);

  const isNoticeCategory = slug === 'notice';
  const displayGlobalNotices = useMemo(() => {
    if (isNoticeCategory) return [];
    const pinnedIds = new Set(pinnedPosts.map(p => p.id));
    return noticePosts.filter(p => !pinnedIds.has(p.id));
  }, [isNoticeCategory, noticePosts, pinnedPosts]);

  const renderPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) start = Math.max(0, end - maxVisible);
    for (let i = start; i < end; i++) pages.push(i);
    return pages;
  };

  return (
    <Layout>
      <div className="board-list">
        <div className="board-list__header">
          <h1 className="board-list__title">{categoryName}</h1>
          {canWrite && (
            <button className="board-list__write-btn" onClick={handleWriteClick}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          )}
        </div>

        <div className="board-list__tag-filter">
          <button className={`board-list__tag-filter-item ${selectedTag === null ? 'board-list__tag-filter-item--active' : ''}`} onClick={() => handleTagClick(null)}>전체</button>
          {availableTags.map((tag) => (
            <button key={tag} className={`board-list__tag-filter-item ${selectedTag === tag ? 'board-list__tag-filter-item--active' : ''}`} onClick={() => handleTagClick(tag)}>{tag}</button>
          ))}
        </div>

        {childCategories.length > 0 && (
          <div className="board-list__tabs">
            <button className={`board-list__tab ${activeTab === 'all' ? 'board-list__tab--active' : ''}`} onClick={() => handleTabClick('all')}>전체</button>
            {childCategories.map((child) => (
              <button key={child.id} className={`board-list__tab ${activeTab === child.slug ? 'board-list__tab--active' : ''}`} onClick={() => handleTabClick(child.slug)}>{child.name}</button>
            ))}
          </div>
        )}

        <div className="board-list__divider" />
        {loading && <div className="board-list__status">로딩 중...</div>}
        {error && <div className="board-list__status board-list__status--error">{error}</div>}

        {!loading && !error && (
          <>
            {/* 글로벌 공지 */}
            {displayGlobalNotices.map((post) => (
              <div key={`notice-${post.id}`} className="board-list__row board-list__row--pinned" onClick={() => navigate(`/board/notice/${post.id}`)}>
                <div className="board-list__row-content">
                  <span className="board-list__category-tag">{getCategoryTagLabel(post, '필독')}</span>
                  <div className="board-list__title-line">
                    <span className="board-list__post-title board-list__post-title--bold">{post.title}</span>
                    {post.commentCount !== undefined && post.commentCount > 0 && <span className="board-list__comments"><MessageBox /> {post.commentCount}</span>}
                    {post.likeCount !== undefined && post.likeCount > 0 && <span className="board-list__likes"><Heart filled={post.isLiked} /> {post.likeCount}</span>}
                  </div>
                </div>
                <div className="board-list__meta">
                  <div className="board-list__author-info">
                    <Link to={post.author?.nickname ? `/user/${post.author.nickname}` : '#'} className="board-list__author" onClick={(e) => e.stopPropagation()}>{post.author?.nickname || '익명'}</Link>
                    <span className="board-list__date">{formatDate(post.createdAt)}</span>
                  </div>
                  <Avatar src={post.author?.profileImage} size={28} className="board-list__avatar" />
                </div>
                <div className="board-list__row-divider" />
              </div>
            ))}

            {/* 현재 카테고리 고정글 */}
            {pinnedPosts.map((post) => (
              <div key={`pinned-${post.id}`} className="board-list__row board-list__row--notice" onClick={() => handleBoardClick(post.id)}>
                <div className="board-list__row-content">
                  <span className="board-list__category-tag">{getCategoryTagLabel(post, isNoticeCategory ? '필독' : '고정')}</span>
                  <div className="board-list__title-line">
                    <span className="board-list__post-title board-list__post-title--bold">{post.title}</span>
                    {post.commentCount !== undefined && post.commentCount > 0 && <span className="board-list__comments"><MessageBox /> {post.commentCount}</span>}
                    {post.likeCount !== undefined && post.likeCount > 0 && <span className="board-list__likes"><Heart filled={post.isLiked} /> {post.likeCount}</span>}
                  </div>
                </div>
                <div className="board-list__meta">
                  <div className="board-list__author-info">
                    <Link to={post.author?.nickname ? `/user/${post.author.nickname}` : '#'} className="board-list__author" onClick={(e) => e.stopPropagation()}>{post.author?.nickname || '익명'}</Link>
                    <span className="board-list__date">{formatDate(post.createdAt)}</span>
                  </div>
                  <Avatar src={post.author?.profileImage} size={28} className="board-list__avatar" />
                </div>
                <div className="board-list__row-divider" />
              </div>
            ))}

            {/* 일반 게시글 */}
            {boards.length === 0 && pinnedPosts.length === 0 && displayGlobalNotices.length === 0 ? (
              <div className="board-list__status">게시글이 없습니다.</div>
            ) : (
              boards.map((post) => (
                <div key={post.id} className="board-list__row" onClick={() => handleBoardClick(post.id)}>
                  <div className="board-list__row-content">
                    <span className="board-list__category-tag">{getCategoryTagLabel(post)}</span>
                    <div className="board-list__title-line">
                      <span className="board-list__post-title">{post.title}</span>
                      {post.commentCount !== undefined && post.commentCount > 0 && <span className="board-list__comments"><MessageBox /> {post.commentCount}</span>}
                      {post.likeCount !== undefined && post.likeCount > 0 && <span className="board-list__likes"><Heart filled={post.isLiked} /> {post.likeCount}</span>}
                    </div>
                  </div>
                  <div className="board-list__meta">
                    <div className="board-list__author-info">
                      <Link to={post.author?.nickname ? `/user/${post.author.nickname}` : '#'} className="board-list__author" onClick={(e) => e.stopPropagation()}>{post.author?.nickname || '익명'}</Link>
                      <span className="board-list__date">{formatDate(post.createdAt)}</span>
                    </div>
                    <Avatar src={post.author?.profileImage} size={28} className="board-list__avatar" />
                  </div>
                  <div className="board-list__row-divider" />
                </div>
              ))
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="board-list__pagination">
                <button className="board-list__page-btn" onClick={() => handlePageChange(0)} disabled={currentPage === 0}>«</button>
                <button className="board-list__page-btn" onClick={() => handlePageChange(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>‹</button>
                {renderPageNumbers().map((page) => (
                  <button key={page} className={`board-list__page-num ${page === currentPage ? 'board-list__page-num--active' : ''}`} onClick={() => handlePageChange(page)}>{page + 1}</button>
                ))}
                <button className="board-list__page-btn" onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1}>›</button>
                <button className="board-list__page-btn" onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage >= totalPages - 1}>»</button>
              </div>
            )}

            {/* 검색 */}
            <form className="board-list__search" onSubmit={handleSearch}>
              <input type="text" className="board-list__search-input" placeholder="검색어를 입력하세요" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
              <button type="submit" className="board-list__search-btn">검색</button>
            </form>
          </>
        )}
      </div>
    </Layout>
  );
}

export default BoardListPage;