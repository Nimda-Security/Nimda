import React, { useState, useEffect } from "react";
import { getBoardListAPI } from "@/api/board";

interface NoticeItem {
  id: number;
  tag: string;
  tagType: "pinned" | "notice" | "normal";
  title: string;
  date: string;
}

const NoticeSection: React.FC = () => {
  const [noticeData, setNoticeData] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        setLoading(true);
        // 공지사항 카테고리 slug (필요시 수정 가능)
        const response = await getBoardListAPI({
          slug: "notice", // 공지사항 카테고리 slug
          page: 0,
          size: 20, // 충분히 많이 가져와서 필터링
          sort: "createdAt,desc",
        });

        if (response.success && response.posts) {
          const pinnedPosts = response.posts.filter((post) => post.pinned);
          const normalPosts = response.posts.filter((post) => !post.pinned).slice(0, 2);

          const formatDate = (dateString: string) => {
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

          const items: NoticeItem[] = [
            ...pinnedPosts.map((post) => ({
              id: post.id,
              tag: "필독",
              tagType: "pinned" as const,
              title: post.title,
              date: formatDate(post.createdAt),
            })),
            ...normalPosts.map((post, index) => ({
              id: post.id,
              tag: "공지",
              tagType: index === 0 ? ("notice" as const) : ("normal" as const),
              title: post.title,
              date: formatDate(post.createdAt),
            })),
          ];

          setNoticeData(items);
        }
      } catch (error) {
        console.error("공지사항 로드 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotices();
  }, []);

  if (loading) {
    return (
      <section className="home-notice">
        <h2 className="home-section-title">공지사항</h2>
        <div className="home-notice__divider" />
        <div className="home-notice__list">
          <div style={{ padding: "16px", textAlign: "center", color: "#999" }}>
            로딩 중...
          </div>
        </div>
      </section>
    );
  }

  if (noticeData.length === 0) {
    return (
      <section className="home-notice">
        <h2 className="home-section-title">공지사항</h2>
        <div className="home-notice__divider" />
        <div className="home-notice__list">
          <div style={{ padding: "16px", textAlign: "center", color: "#999" }}>
            공지사항이 없습니다.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="home-notice">
      <h2 className="home-section-title">공지사항</h2>
      <div className="home-notice__divider" />
      <div className="home-notice__list">
        {noticeData.map((item) => (
          <div
            key={item.id}
            className={`home-notice__row ${item.tagType === "pinned"
              ? "home-notice__row--pinned"
              : item.tagType === "notice"
                ? "home-notice__row--notice"
                : "home-notice__row--normal"
              }`}
          >
            <div
              className={`home-notice__tag ${item.tagType === "pinned" || item.tagType === "notice"
                ? "home-notice__tag--red"
                : "home-notice__tag--gray"
                }`}
            >
              {item.tag}
            </div>
            <p
              className={`home-notice__title ${item.tagType === "pinned"
                ? "home-notice__title--bold"
                : ""
                }`}
            >
              {item.title}
            </p>
            <span className="home-notice__date">{item.date}</span>
            <div className="home-notice__row-divider" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default NoticeSection;
