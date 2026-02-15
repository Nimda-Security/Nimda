import React from "react";

interface NoticeItem {
  id: number;
  tag: string;
  tagType: "pinned" | "notice" | "normal";
  title: string;
  date: string;
}

const noticeData: NoticeItem[] = [
  {
    id: 1,
    tag: "필독",
    tagType: "pinned",
    title: "2026년 동아리 운영 방침",
    date: "15:38",
  },
  {
    id: 2,
    tag: "필독",
    tagType: "pinned",
    title: "2026 신입 부원 모집 일정",
    date: "02.20",
  },
  {
    id: 3,
    tag: "공지",
    tagType: "notice",
    title: "저는 사이트를 만들기 위해 온 사람입니다",
    date: "02.04",
  },
  {
    id: 4,
    tag: "공지",
    tagType: "normal",
    title: "고정글은 개수 상관없이 다 띄우고 그냥 글은 2개까지만 뜨게 합시다",
    date: "25.12.31",
  },
];

const NoticeSection: React.FC = () => {
  return (
    <section className="home-notice">
      <h2 className="home-section-title">공지사항</h2>
      <div className="home-notice__divider" />
      <div className="home-notice__list">
        {noticeData.map((item) => (
          <div
            key={item.id}
            className={`home-notice__row ${
              item.tagType === "pinned"
                ? "home-notice__row--pinned"
                : item.tagType === "notice"
                ? "home-notice__row--notice"
                : "home-notice__row--normal"
            }`}
          >
            <div
              className={`home-notice__tag ${
                item.tagType === "pinned" || item.tagType === "notice"
                  ? "home-notice__tag--red"
                  : "home-notice__tag--gray"
              }`}
            >
              {item.tag}
            </div>
            <p
              className={`home-notice__title ${
                item.tagType === "pinned"
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
