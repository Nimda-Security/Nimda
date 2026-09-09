import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecentPostsAPI } from '@/api/board';
import type { Board } from '@/domains/Board/types';
import { Heart } from '@/components/icons/Heart';
import { MessageBox } from '@/components/icons/MessageBox';

const LatestPostsSection: React.FC = () => {
  const navigate = useNavigate();
  const [latestPosts, setLatestPosts] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLatestPosts = async () => {
      try {
        setLoading(true);
        const response = await getRecentPostsAPI(10);

        if (response.success && response.posts) {
          setLatestPosts(response.posts);
        }
      } catch (error) {
        console.error('최신글 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLatestPosts();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const postDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (postDate.getTime() === today.getTime()) {
      // 오늘인 경우 시간만 표시
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else {
      // 오늘이 아닌 경우 날짜만 표시
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      // 연도가 현재 연도와 다르면 연도 포함
      if (year !== now.getFullYear()) {
        return `${String(year).slice(2)}.${month}.${day}`;
      }
      return `${month}.${day}`;
    }
  };

  const getCategorySlug = (board: Board): string => {
    return board.category?.slug || '';
  };

  if (loading) {
    return (
      <section className="home-latest">
        <h2 className="home-section-title">전체 최신글</h2>
        <div className="home-latest__divider" />
        <div className="home-latest__list">
          <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
            로딩 중...
          </div>
        </div>
      </section>
    );
  }

  if (latestPosts.length === 0) {
    return (
      <section className="home-latest">
        <h2 className="home-section-title">전체 최신글</h2>
        <div className="home-latest__divider" />
        <div className="home-latest__list">
          <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
            최신글이 없습니다.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="home-latest">
      <h2 className="home-section-title">전체 최신글</h2>
      <div className="home-latest__divider" />
      <div className="home-latest__list">
        {latestPosts.map((post) => {
          const categorySlug = getCategorySlug(post);
          return (
            <div
              key={post.id}
              className="home-latest__row"
              style={{ padding: '0 16px' }}
              onClick={() => navigate(`/board/${categorySlug}/${post.id}`)}
            >
              <div className="home-latest__title-wrap">
                {post.tag?.tagName && (
                  <span className="home-latest__tag">{post.tag.tagName}</span>
                )}
                <p className="home-latest__title">{post.title}</p>
              </div>
              <div className="home-latest__comments">
                <MessageBox />
                <span className="home-latest__comments-count">
                  {post.commentCount ?? 0}
                </span>
              </div>
              <div className="home-latest__likes">
                <Heart filled={post.isLiked} />
                <span className="home-latest__likes-count">
                  {post.likeCount || 0}
                </span>
              </div>
              <span className="home-latest__date">
                {formatDate(post.createdAt)}
              </span>
              <div className="home-latest__row-divider" />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LatestPostsSection;
