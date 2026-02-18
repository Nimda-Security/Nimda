'use client';
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";

export default function Gallery({ icon, trafficLights, onDragHandle }) {
  const [lightboxImage, setLightboxImage] = useState(null);
  const galleryRef = useRef(null);

  // Scroll to bottom on mount (Latest photos)
  useEffect(() => {
    if (galleryRef.current) {
      galleryRef.current.scrollTop = galleryRef.current.scrollHeight;
    }
  }, []);

  return (
    <>
      <div className="window-gallery-content">
        <div className="gallery-sidebar" onMouseDown={onDragHandle}>
          {/* ... Sidebar content identical to before ... */}
          {trafficLights}
          <div className="gallery-sidebar-section">
            <div className="gallery-sidebar-title">사진</div>
            <button className="gallery-sidebar-item active">
              <span className="gallery-sidebar-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none"/><path d="M21 19V15l-5-5L5 19h16z" fill="currentColor" stroke="none"/></svg>
              </span>
              보관함
            </button>
            <button className="gallery-sidebar-item">
              <span className="gallery-sidebar-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </span>
              즐겨찾기
            </button>
            <button className="gallery-sidebar-item">
              <span className="gallery-sidebar-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </span>
              최근 저장된 항목
            </button>
            <button className="gallery-sidebar-item">
              <span className="gallery-sidebar-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </span>
              최근 삭제된 항목
            </button>
          </div>
          <div className="gallery-sidebar-section">
            <div className="gallery-sidebar-title">모음</div>
            <button className="gallery-sidebar-item">
              <span className="gallery-sidebar-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
              날짜
            </button>
            <button className="gallery-sidebar-item">
              <span className="gallery-sidebar-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><polygon points="10 8 16 12 10 16" fill="currentColor" stroke="none"/></svg>
              </span>
              추억
            </button>
            <button className="gallery-sidebar-item">
              <span className="gallery-sidebar-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V7"/><path d="M8 21V7"/><path d="M15 7V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v3"/></svg>
              </span>
              여행
            </button>
            <button className="gallery-sidebar-item">
              <span className="gallery-sidebar-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </span>
              기타
            </button>
            <button className="gallery-sidebar-item">
              <span className="gallery-sidebar-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8l2-6h12l2 6"/><path d="M22 8v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8"/><path d="M4 8h16"/></svg>
              </span>
              앨범
            </button>
          </div>
        </div>
        <div className="gallery-right-panel">
          <div className="gallery-toolbar" onMouseDown={onDragHandle}>
            <div className="gallery-search-container" onMouseDown={(e) => e.stopPropagation()}>
              <svg 
                className="gallery-search-icon-img" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" className="gallery-search-input" placeholder="검색" />
            </div>
          </div>

          <div className="gallery-date-header">2025년</div>
          <div className="gallery-main" ref={galleryRef}>
            {/* Section 2025 Grid */}
            <div className="gallery-grid">
              {icon.content.map((img, i) => (
                <button
                  key={`2025-${i}`}
                  className="gallery-grid-item"
                  onClick={() => setLightboxImage(img)}
                >
                  <img src={img.src} alt={img.title} />
                </button>
              ))}
            </div>
            
            <div className="gallery-footer">
              <div className="gallery-footer-title">{icon.content.length}장의 사진</div>
              <div className="gallery-footer-subtitle">추후 업데이트 예정</div>
            </div>
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
