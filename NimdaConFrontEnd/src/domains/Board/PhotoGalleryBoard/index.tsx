import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Avatar from "@/components/Avatar/Avatar";
import { Heart } from "@/components/icons/Heart";
import { getBoardListAPI, getBoardDetailAPI } from "@/api/board";
import { getAttachmentPresignedUrl } from "@/api/attachments";
import type { Board } from "@/domains/Board/types";
import "./PhotoGalleryBoard.css";
import { formatDate } from '@/utils/formatDate';
import { useLikeStatuses } from "@/domains/Board/useLikeStatuses";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];

const getFirstImageAttachmentId = (board: Board): number | null => {
  if (!board.attachments || board.attachments.length === 0) return null;
  for (const att of board.attachments) {
    if (att.originFilename) {
      const ext = att.originFilename.split(".").pop()?.toLowerCase() || "";
      if (IMAGE_EXTENSIONS.includes(ext)) return att.id;
    }
    return att.id;
  }
  return null;
};

const PAGE_SIZE = 8;

const PhotoGalleryBoard: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Board[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  // 모든 페이지에서 누적한 연도 목록
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const likeStatuses = useLikeStatuses(posts);

  const loadPosts = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const result = await getBoardListAPI({
        slug: "picture-board",
        page,
        size: PAGE_SIZE,
        sort: "createdAt,desc",
      });

      if (result.success) {
        setPosts(result.posts);
        setTotalPages(result.totalPages);

        // 현재 페이지의 연도를 기존 목록에 병합
        const newYears = result.posts.map((p) => new Date(p.createdAt).getFullYear());
        setAvailableYears((prev) => {
          const merged = Array.from(new Set([...prev, ...newYears])).sort((a, b) => b - a);
          return merged;
        });

        // 썸네일 presigned URL 병렬 로드
        const thumbMap: Record<number, string | null> = {};
        await Promise.all(
          result.posts.map(async (post) => {
            try {
              const detail = await getBoardDetailAPI(post.id);
              if (detail.success && "board" in detail) {
                const attId = getFirstImageAttachmentId(detail.board);
                thumbMap[post.id] = attId ? await getAttachmentPresignedUrl(attId) : null;
              } else {
                thumbMap[post.id] = null;
              }
            } catch {
              thumbMap[post.id] = null;
            }
          })
        );
        setThumbnails(thumbMap);
      }
    } catch (e) {
      console.error("사진첩 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(currentPage);
  }, [currentPage, loadPosts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const displayPosts = selectedYear
    ? posts.filter((p) => new Date(p.createdAt).getFullYear() === selectedYear)
    : posts;

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
      <div className="board-list photo-gallery-board">
        {/* 헤더: 제목 + 글쓰기 버튼 */}
        <div className="board-list__header">
          <h1 className="board-list__title">사진첩</h1>
          <button
            className="board-list__write-btn"
            onClick={() => navigate("/board/picture-board/write")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span style={{ fontWeight: 600, fontSize: '15px' }}>글쓰기</span>
          </button>
        </div>

        {/* 연도 필터 탭 */}
        <div className="board-list__tag-filter">
          <button
            className={`board-list__tag-filter-item ${selectedYear === null ? "board-list__tag-filter-item--active" : ""}`}
            onClick={() => setSelectedYear(null)}
          >
            전체
          </button>
          {availableYears.map((year) => (
            <button
              key={year}
              className={`board-list__tag-filter-item ${selectedYear === year ? "board-list__tag-filter-item--active" : ""}`}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
        </div>

        <div className="board-list__divider" />

        {/* 로딩 */}
        {loading && <div className="board-list__status">로딩 중...</div>}

        {/* 게시글 없음 */}
        {!loading && displayPosts.length === 0 && (
          <div className="board-list__status">게시글이 없습니다.</div>
        )}

        {/* 갤러리 그리드 */}
        {!loading && displayPosts.length > 0 && (
          <>
            <div className="photo-gallery-board__grid">
              {displayPosts.map((post) => {
                const thumbnail = thumbnails[post.id] ?? null;
                return (
                  <Link
                    key={post.id}
                    to={`/board/picture-board/${post.id}`}
                    className="photo-gallery-board__card"
                  >
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={post.title}
                        className="photo-gallery-board__image"
                      />
                    ) : (
                      <div className="photo-gallery-board__image photo-gallery-board__image--placeholder" />
                    )}
                    <div className="photo-gallery-board__info">
                      <div className="photo-gallery-board__author">
                        <Avatar
                          src={post.author?.profileImage}
                          size={28}
                          className="photo-gallery-board__avatar"
                        />
                        <span className="photo-gallery-board__nickname">
                          {post.author?.nickname || "익명"}
                        </span>
                      </div>
                      <div className="photo-gallery-board__title-line">
                        <p className="photo-gallery-board__title">{post.title}</p>
                        <div className="photo-gallery-board__counts">
                          {post.commentCount !== undefined && post.commentCount > 0 && (
                            <span className="photo-gallery-board__count photo-gallery-board__count--comments">
                              [{post.commentCount}]
                            </span>
                          )}
                          {post.likeCount !== undefined && post.likeCount > 0 && (
                            <span className="photo-gallery-board__count photo-gallery-board__count--likes">
                              <Heart filled={likeStatuses[post.id] ?? false} />
                              <span>{post.likeCount}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="photo-gallery-board__meta">
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* 페이지네이션 */}
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
                {renderPageNumbers().map((page) => (
                  <button
                    key={page}
                    className={`board-list__page-num ${page === currentPage ? "board-list__page-num--active" : ""}`}
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
          </>
        )}
      </div>
    </Layout>
  );
};

export default PhotoGalleryBoard;
