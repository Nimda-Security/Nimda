import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPopularPostsAPI } from "@/api/board";
import type { Board } from "@/domains/Board/types";
import { HeartIcon } from "@/components/icons/Heart";
import { CommentIcon } from "@/components/icons/Comment";

const PopularPostsSection: React.FC = () => {
  const navigate = useNavigate();
  const [popularPosts, setPopularPosts] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPopularPosts = async () => {
      try {
        setLoading(true);
        // 전체 인기글 조회 (카테고리 제한 없음, 최대 10개)
        const response = await getPopularPostsAPI(undefined, undefined, 10);

        if (response.success && response.posts) {
          // 최대 10개로 제한
          setPopularPosts(response.posts.slice(0, 10));
        }
      } catch (error) {
        console.error("인기글 로드 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPopularPosts();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const postDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (postDate.getTime() === today.getTime()) {
      // 오늘인 경우 시간만 표시
      return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    } else {
      // 오늘이 아닌 경우 날짜만 표시
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      // 연도가 현재 연도와 다르면 연도 포함
      if (year !== now.getFullYear()) {
        return `${String(year).slice(2)}.${month}.${day}`;
      }
      return `${month}.${day}`;
    }
  };

  const getCategorySlug = (board: Board): string => {
    return board.category?.slug || "";
  };

  if (loading) {
    return (
      <section className="home-popular">
        <h2 className="home-section-title">전체 인기글</h2>
        <div className="home-popular__divider" />
        <div className="home-popular__list">
          <div style={{ padding: "16px", textAlign: "center", color: "#999" }}>
            로딩 중...
          </div>
        </div>
      </section>
    );
  }

  if (popularPosts.length === 0) {
    return (
      <section className="home-popular">
        <h2 className="home-section-title">전체 인기글</h2>
        <div className="home-popular__divider" />
        <div className="home-popular__list">
          <div style={{ padding: "16px", textAlign: "center", color: "#999" }}>
            인기글이 없습니다.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="home-popular">
      <h2 className="home-section-title">전체 인기글</h2>
      <div className="home-popular__divider" />
      <div className="home-popular__list">
        {popularPosts.map((post) => {
          const categorySlug = getCategorySlug(post);
          return (
            <div
              key={post.id}
              className="home-popular__row"
              onClick={() => navigate(`/board/${categorySlug}/${post.id}`)}
            >
              <p className="home-popular__title">{post.title}</p>
              <div className="home-popular__comments">
                <CommentIcon />
                <span className="home-popular__comments-count">{0}</span>
              </div>
              <div className="home-popular__likes">
                <HeartIcon filled={true} />
                <span className="home-popular__likes-count">{post.likeCount || 0}</span>
              </div>
              <span className="home-popular__date">{formatDate(post.createdAt)}</span>
              <div className="home-popular__row-divider" />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PopularPostsSection;
