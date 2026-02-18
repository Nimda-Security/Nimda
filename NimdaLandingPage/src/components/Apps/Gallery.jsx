'use client';
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";

export default function Gallery({ icon, trafficLights, onDragHandle }) {
  const [lightboxImage, setLightboxImage] = useState(null);

  return (
    <>
      <div className="window-gallery-content">
        <div className="gallery-sidebar" onMouseDown={onDragHandle}>
          {trafficLights}
          <div className="gallery-sidebar-section">
            <div className="gallery-sidebar-title">보관함</div>
            <button className="gallery-sidebar-item active">
              <span className="gallery-sidebar-icon">🖼</span>모든 사진
            </button>
            <button className="gallery-sidebar-item">
              <span className="gallery-sidebar-icon">❤️</span>즐겨찾기
            </button>
            <button className="gallery-sidebar-item">
              <span className="gallery-sidebar-icon">🕐</span>최근 항목
            </button>
          </div>
          <div className="gallery-sidebar-section">
            <div className="gallery-sidebar-title">모음</div>
            <button className="gallery-sidebar-item">
              <span className="gallery-sidebar-icon">📅</span>날짜
            </button>
            <button className="gallery-sidebar-item">
              <span className="gallery-sidebar-icon">💭</span>추억
            </button>
            <button className="gallery-sidebar-item">
              <span className="gallery-sidebar-icon">✈️</span>여행
            </button>
          </div>
          <div className="gallery-sidebar-section">
            <div className="gallery-sidebar-title">미디어 유형</div>
            <button className="gallery-sidebar-item">
              <span className="gallery-sidebar-icon">🎬</span>비디오
            </button>
            <button className="gallery-sidebar-item">
              <span className="gallery-sidebar-icon">📸</span>셀피
            </button>
          </div>
        </div>
        <div className="gallery-main">
          <div className="gallery-date-header">2025년 활동 사진</div>
          <div className="gallery-date-sub">{icon.content.length}장의 사진</div>
          <div className="gallery-grid">
            {icon.content.map((img, i) => (
              <button
                key={i}
                className="gallery-grid-item"
                onClick={() => setLightboxImage(img)}
              >
                <img src={img.src} alt={img.title} />
                <div className="gallery-grid-caption">{img.title}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 라이트박스 오버레이 */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
          >
            <button className="lightbox-close" onClick={() => setLightboxImage(null)}>✕</button>
            <motion.img
              className="lightbox-image"
              src={lightboxImage.src}
              alt={lightboxImage.title}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            />
            <div className="lightbox-caption">
              <h3>{lightboxImage.title}</h3>
              <p>{lightboxImage.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
