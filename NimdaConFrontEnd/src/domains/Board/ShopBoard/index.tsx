import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { getAttachmentPresignedUrl } from '@/api/attachments';
import { getBoardDetailAPI, getBoardListAPI } from '@/api/board';
import { getAllCategoriesAPI } from '@/api/category';
import { getTagsByCategoryAPI } from '@/api/tag';
import { isAdmin } from '@/utils/jwt';
import type { Board } from '@/domains/Board/types';
import '@/domains/Board/BoardList/BoardList.css';
import './ShopBoard.css';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
const PAGE_SIZE = 12;

const getFirstImageAttachmentId = (board: Board): number | null => {
  if (!board.attachments || board.attachments.length === 0) return null;
  if (
    board.thumbnailAttachmentId &&
    board.attachments.some((attachment) => attachment.id === board.thumbnailAttachmentId)
  ) {
    return board.thumbnailAttachmentId;
  }
  for (const attachment of board.attachments) {
    const ext = attachment.originFilename?.split('.').pop()?.toLowerCase() || '';
    if (!attachment.originFilename || IMAGE_EXTENSIONS.includes(ext)) return attachment.id;
  }
  return null;
};

interface ShopBoardProps {
  boardSlug: string;
}

const ShopBoard: React.FC<ShopBoardProps> = ({ boardSlug }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Board[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('마일리지 상점');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const loadPosts = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const result = await getBoardListAPI({
        slug: boardSlug,
        page,
        size: PAGE_SIZE,
        sort: 'createdAt,desc',
      });

      if (result.success) {
        setPosts(result.posts);
        setTotalPages(result.totalPages);
        setCategoryName(result.category?.name || '마일리지 상점');

        const thumbMap: Record<number, string | null> = {};
        await Promise.all(
          result.posts.map(async (post) => {
            try {
              const detail = await getBoardDetailAPI(post.id);
              if (detail.success && 'board' in detail) {
                const attachmentId = getFirstImageAttachmentId(detail.board);
                thumbMap[post.id] = attachmentId ? await getAttachmentPresignedUrl(attachmentId) : null;
              } else {
                thumbMap[post.id] = null;
              }
            } catch {
              thumbMap[post.id] = null;
            }
          })
        );
        setThumbnails(thumbMap);
      } else {
        setPosts([]);
        setTotalPages(0);
      }
    } finally {
      setLoading(false);
    }
  }, [boardSlug]);

  useEffect(() => {
    loadPosts(currentPage);
  }, [currentPage, loadPosts]);

  useEffect(() => {
    let cancelled = false;
    const fetchTags = async () => {
      try {
        const categories = await getAllCategoriesAPI();
        const category = categories.find((item) => item.slug === boardSlug);
        if (!category?.id) return;
        const tags = await getTagsByCategoryAPI(category.id);
        if (!cancelled) setAvailableTags(tags.map((tag) => tag.tagName));
      } catch {
        if (!cancelled) setAvailableTags([]);
      }
    };

    fetchTags();
    return () => {
      cancelled = true;
    };
  }, [boardSlug]);

  const displayPosts = selectedTag
    ? posts.filter((post) => post.tag?.tagName === selectedTag)
    : posts;

  const renderPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) start = Math.max(0, end - maxVisible);
    for (let i = start; i < end; i += 1) pages.push(i);
    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="board-list shop-board">
        <div className="board-list__header">
          <h1 className="board-list__title">{categoryName}</h1>
          {isAdmin() && (
            <button
              className="board-list__write-btn"
              onClick={() => navigate(`/board/${boardSlug}/write`)}
              aria-label="상품 등록"
            >
              +
            </button>
          )}
        </div>

        {availableTags.length > 0 && (
          <div className="board-list__tag-filter">
            <button
              className={`board-list__tag-filter-item ${selectedTag === null ? 'board-list__tag-filter-item--active' : ''}`}
              onClick={() => setSelectedTag(null)}
            >
              전체
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag}
                className={`board-list__tag-filter-item ${selectedTag === tag ? 'board-list__tag-filter-item--active' : ''}`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="shop-board__toolbar">
          <p className="shop-board__summary">마일리지로 구매할 수 있는 아이템입니다.</p>
        </div>
        <div className="board-list__divider" />

        {loading && <div className="board-list__status">상품을 불러오는 중...</div>}
        {!loading && displayPosts.length === 0 && (
          <div className="board-list__status">등록된 상품이 없습니다.</div>
        )}

        {!loading && displayPosts.length > 0 && (
          <>
            <div className="shop-board__grid">
              {displayPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/board/${boardSlug}/${post.id}`}
                  className="shop-board__card"
                >
                  <div className="shop-board__image-wrap">
                    {thumbnails[post.id] ? (
                      <img src={thumbnails[post.id] || ''} alt={post.title} className="shop-board__image" />
                    ) : post.itemType === 'BADGE' && post.profileDecoration ? (
                      <img
                        src={post.profileDecoration.src}
                        alt={post.profileDecoration.label}
                        className="shop-board__image"
                      />
                    ) : (
                      <div className="shop-board__image-placeholder" />
                    )}
                    {post.tag?.tagName && <span className="shop-board__tag">{post.tag.tagName}</span>}
                  </div>
                  <div className="shop-board__info">
                    <p className="shop-board__name">{post.title}</p>
                    <span className="shop-board__price">
                      {(post.itemPrice ?? 0).toLocaleString()} NC
                    </span>
                  </div>
                </Link>
              ))}
            </div>

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
          </>
        )}
      </div>
    </Layout>
  );
};

export default ShopBoard;
