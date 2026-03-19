import React from "react";
import { HeartIcon } from "@/components/icons/Heart";

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
