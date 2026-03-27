import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart } from "@/components/icons/Heart";
import { MessageBox } from "@/components/icons/MessageBox";
import { getBoardListAPI, getBoardDetailAPI } from "@/api/board";
import { getAttachmentPresignedUrl } from "@/api/attachments";
import type { Board } from "@/domains/Board/types";
import { formatDate } from '@/utils/formatDate';
import { useLikeStatuses } from "@/domains/Board/useLikeStatuses";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];

/**
 * 첨부파일에서 첫 번째 이미지 첨부의 ID 추출
 */
const getFirstImageAttachmentId = (board: Board): number | null => {
  if (!board.attachments || board.attachments.length === 0) return null;
  
  for (const att of board.attachments) {
    if (att.originFilename) {
      const ext = att.originFilename.split(".").pop()?.toLowerCase() || "";
      if (IMAGE_EXTENSIONS.includes(ext)) {
        return att.id;
      }
    }
    // originFilename이 없으면 첫 번째 첨부 사용
    return att.id;
  }
  return null;
};


const PhotoGallerySection: React.FC = () => {
  const [posts, setPosts] = useState<Board[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [categorySlug, setCategorySlug] = useState("picture-board");
  const likeStatuses = useLikeStatuses(posts);  

  useEffect(() => {
    const loadPhotoPosts = async () => {
      try {
        const result = await getBoardListAPI({
          slug: "picture-board",
          page: 0,
          size: 4,
          sort: "createdAt,desc",
        });

        if (result.success) {
          setPosts(result.posts);
          if (result.category?.slug) {
            setCategorySlug(result.category.slug);
          }

          // 각 게시글의 상세를 병렬로 조회하여 첨부 이미지의 presigned URL 확보
          const thumbMap: Record<number, string | null> = {};
          await Promise.all(
            result.posts.map(async (post) => {
              try {
                const detail = await getBoardDetailAPI(post.id);
                if (detail.success && "board" in detail) {
                  const attId = getFirstImageAttachmentId(detail.board);
                  if (attId) {
                    thumbMap[post.id] = await getAttachmentPresignedUrl(attId);
                  } else {
                    thumbMap[post.id] = null;
                  }
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
      } catch (error) {
        console.error("사진첩 게시글 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPhotoPosts();
  }, []);

  return (
    <section className="home-gallery">
      <h2 className="home-section-title">사진첩</h2>
      <div className="home-gallery__divider" />
      {loading ? (
        <div style={{ padding: "16px", textAlign: "center", color: "#999", fontSize: "14px" }}>
          로딩 중...
        </div>
      ) : posts.length > 0 ? (
        <div className="home-gallery__grid">
          {posts.map((post) => {
            const thumbnail = thumbnails[post.id] || null;
            return (
              <Link
                key={post.id}
                to={`/board/${categorySlug}/${post.id}`}
                className="home-gallery__card"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={post.title}
                    className="home-gallery__image"
                  />
                ) : (
                  <div
                    className="home-gallery__image"
                    style={{ backgroundColor: "#e8e8e8" }}
                  />
                )}
                <p className="home-gallery__card-title">{post.title}</p>
                <div className="home-gallery__card-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="home-gallery__card-comments">
                      <MessageBox />
                      <span>{post.commentCount ?? 0}</span>
                    </div>
                    <div className="home-gallery__card-likes">
                      <Heart filled={likeStatuses[post.id] ?? false} />
                      <span>{post.likeCount ?? 0}</span>
                    </div>
                  </div>
                  <span className="home-gallery__card-separator">|</span>
                  <span className="home-gallery__card-date">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: "16px", textAlign: "center", color: "#999", fontSize: "14px" }}>
          사진첩 게시글이 없습니다.
        </div>
      )}
    </section>
  );
};

export default PhotoGallerySection;
