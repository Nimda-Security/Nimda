import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart } from "@/components/icons/Heart";
import { getBoardListAPI } from "@/api/board";
import type { Board } from "@/domains/Board/types";

/**
 * 게시글 content(HTML)에서 첫 번째 <img> src를 추출
 */
const extractFirstImage = (html: string): string | null => {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
};

/**
 * 날짜 포맷 (오늘이면 HH:MM, 올해면 MM.DD, 아니면 YY.MM.DD)
 */
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  if (date.getFullYear() === now.getFullYear()) {
    return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  }

  return `${String(date.getFullYear()).slice(2)}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
};

const PhotoGallerySection: React.FC = () => {
  const [posts, setPosts] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorySlug, setCategorySlug] = useState("picture-board");

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
            const thumbnail = extractFirstImage(post.content) || post.filepath || null;
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
                  <div className="home-gallery__card-likes">
                    <Heart filled={false} />
                    <span>{post.likeCount ?? 0}</span>
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
