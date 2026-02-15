import React from "react";

interface PopularPost {
  id: number;
  board: string;
  title: string;
  comments: number;
  likes: number;
  date: string;
}

const popularPosts: PopularPost[] = [
  { id: 1, board: "자유", title: "후유증 심한 헌터x헌터 명장면 ㄷ...", comments: 999, likes: 999, date: "02.04" },
  { id: 2, board: "구함", title: "독도 해커톤 나가실 분 구해요", comments: 5, likes: 17, date: "25.12.31" },
  { id: 3, board: "학술", title: "[레전%드자$료!] in프@런 C언...", comments: 12, likes: 22, date: "01.30" },
  { id: 4, board: "사진", title: "MT 사진 가져가세용", comments: 12, likes: 9, date: "01.02" },
  { id: 5, board: "사진", title: "MT 사진 가져가세용", comments: 12, likes: 9, date: "01.02" },
  { id: 6, board: "사진", title: "MT 사진 가져가세용", comments: 12, likes: 9, date: "01.02" },
  { id: 7, board: "사진", title: "MT 사진 가져가세용", comments: 12, likes: 9, date: "01.02" },
  { id: 8, board: "사진", title: "MT 사진 가져가세용", comments: 12, likes: 9, date: "01.02" },
  { id: 9, board: "사진", title: "MT 사진 가져가세용", comments: 12, likes: 9, date: "01.02" },
  { id: 10, board: "사진", title: "MT 사진 가져가세용", comments: 12, likes: 9, date: "01.02" },
];

const HeartIcon: React.FC = () => (
  <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 11.5C7 11.5 0.5 7.5 0.5 3.5C0.5 1.84315 1.84315 0.5 3.5 0.5C4.7886 0.5 5.9053 1.24284 6.4472 2.32918C6.63191 2.69861 7.36809 2.69861 7.5528 2.32918C8.0947 1.24284 9.2114 0.5 10.5 0.5C12.1569 0.5 13.5 1.84315 13.5 3.5C13.5 7.5 7 11.5 7 11.5Z"
      fill="#D64454"
    />
  </svg>
);

const PopularPostsSection: React.FC = () => {
  return (
    <section className="home-popular">
      <h2 className="home-section-title">전체 인기글</h2>
      <div className="home-popular__divider" />
      <div className="home-popular__list">
        {popularPosts.map((post) => (
          <div key={post.id} className="home-popular__row">
            <div className="home-popular__tag">{post.board}</div>
            <p className="home-popular__title">{post.title}</p>
            <span className="home-popular__comments">{post.comments}</span>
            <div className="home-popular__likes">
              <HeartIcon />
              <span className="home-popular__likes-count">{post.likes}</span>
            </div>
            <span className="home-popular__date">{post.date}</span>
            <div className="home-popular__row-divider" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularPostsSection;
