import React from "react";

interface PhotoItem {
  id: number;
  title: string;
  likes: number;
  date: string;
  bgColor: string;
}

const photoData: PhotoItem[] = [
  { id: 1, title: "제 친필 사인을 뿌립니다", likes: 7, date: "07:01", bgColor: "#e8d5c4" },
  { id: 2, title: "오늘 두쫀쿠 먹엇어요", likes: 11, date: "02.07", bgColor: "#c4d4e8" },
  { id: 3, title: "소프트 2-2 시간표 평가점여 ㅎ", likes: 1, date: "25.08.25", bgColor: "#d4e8c4" },
  { id: 4, title: "25년 MT 사진입니당", likes: 30, date: "25.06.30", bgColor: "#e8c4d4" },
];

const HeartIcon: React.FC = () => (
  <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 11.5C7 11.5 0.5 7.5 0.5 3.5C0.5 1.84315 1.84315 0.5 3.5 0.5C4.7886 0.5 5.9053 1.24284 6.4472 2.32918C6.63191 2.69861 7.36809 2.69861 7.5528 2.32918C8.0947 1.24284 9.2114 0.5 10.5 0.5C12.1569 0.5 13.5 1.84315 13.5 3.5C13.5 7.5 7 11.5 7 11.5Z"
      fill="#D64454"
    />
  </svg>
);

const PhotoGallerySection: React.FC = () => {
  return (
    <section className="home-gallery">
      <h2 className="home-section-title">사진첩</h2>
      <div className="home-gallery__divider" />
      <div className="home-gallery__grid">
        {photoData.map((photo) => (
          <div key={photo.id} className="home-gallery__card">
            <div
              className="home-gallery__image"
              style={{ backgroundColor: photo.bgColor }}
            />
            <p className="home-gallery__card-title">{photo.title}</p>
            <div className="home-gallery__card-meta">
              <div className="home-gallery__card-likes">
                <HeartIcon />
                <span>{photo.likes}</span>
              </div>
              <span className="home-gallery__card-separator">|</span>
              <span className="home-gallery__card-date">{photo.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PhotoGallerySection;
