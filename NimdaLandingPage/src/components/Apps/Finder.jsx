'use client';
import React from "react";

export default function Finder({ icon, trafficLights, onDragHandle }) {
  return (
    <div className="window-folder-content">
      <div className="finder-sidebar" onMouseDown={onDragHandle}>
        {trafficLights}
        <div className="finder-sidebar-section">
          <div className="finder-sidebar-title">즐겨찾기</div>
          <div className="finder-sidebar-item">
            <span className="finder-sidebar-icon">🖥</span>AirDrop
          </div>
          <div className="finder-sidebar-item">
            <span className="finder-sidebar-icon">🕐</span>최근 항목
          </div>
          <div className="finder-sidebar-item">
            <span className="finder-sidebar-icon">📂</span>응용 프로그램
          </div>
          <div className="finder-sidebar-item active">
            <span className="finder-sidebar-icon">⬇️</span>동아리활동
          </div>
          <div className="finder-sidebar-item">
            <span className="finder-sidebar-icon">📁</span>다운로드
          </div>
        </div>
        <div className="finder-sidebar-section">
          <div className="finder-sidebar-title">NIMDA Cloud</div>
          <div className="finder-sidebar-item">
            <span className="finder-sidebar-icon">🔗</span>공유
          </div>
          <div className="finder-sidebar-item">
            <span className="finder-sidebar-icon">☁️</span>NIMDA Drive
          </div>
          <div className="finder-sidebar-item">
            <span className="finder-sidebar-icon">🖥</span>데스크탑
          </div>
          <div className="finder-sidebar-item">
            <span className="finder-sidebar-icon">📄</span>문서
          </div>
        </div>
        <div className="finder-sidebar-section">
          <div className="finder-sidebar-title">태그</div>
          <div className="finder-sidebar-item">
            <span className="finder-tag-dot" style={{ background: '#ff3b30' }}></span>빨강
          </div>
          <div className="finder-sidebar-item">
            <span className="finder-tag-dot" style={{ background: '#ff9500' }}></span>주황
          </div>
          <div className="finder-sidebar-item">
            <span className="finder-tag-dot" style={{ background: '#34c759' }}></span>초록
          </div>
          <div className="finder-sidebar-item">
            <span className="finder-tag-dot" style={{ background: '#007aff' }}></span>파랑
          </div>
        </div>
      </div>
      <div className="finder-main-wrapper">
        {/* macOS Finder 상단 도구막대 */}
        <div className="finder-toolbar">
          <div className="finder-toolbar-left">
            <button className="finder-toolbar-btn" aria-label="뒤로">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 1L3 6L8 11" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="finder-toolbar-btn" aria-label="앞으로">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 1L9 6L4 11" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span className="finder-toolbar-title">동아리활동</span>
          </div>
          <div className="finder-toolbar-right">
            <div className="finder-view-modes">
              <button className="finder-view-btn active" aria-label="아이콘 보기">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor"/><rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor"/><rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor"/><rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor"/></svg>
              </button>
              <button className="finder-view-btn" aria-label="목록 보기">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="1.5" rx="0.5" fill="currentColor"/><rect x="1" y="6" width="12" height="1.5" rx="0.5" fill="currentColor"/><rect x="1" y="10" width="12" height="1.5" rx="0.5" fill="currentColor"/></svg>
              </button>
              <button className="finder-view-btn" aria-label="컬럼 보기">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="3.5" height="12" rx="0.5" fill="currentColor"/><rect x="5.5" y="1" width="3.5" height="12" rx="0.5" fill="currentColor"/><rect x="10" y="1" width="3.5" height="12" rx="0.5" fill="currentColor"/></svg>
              </button>
            </div>
            <div className="finder-toolbar-search">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="3.5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2"/><path d="M8 8L10.5 10.5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" strokeLinecap="round"/></svg>
              <span>검색</span>
            </div>
          </div>
        </div>
        <div className="finder-main">
          <div className="finder-folder-grid">
            {icon.content.map((cat, i) => (
              <button key={i} className="finder-folder-item">
                <div className="finder-folder-icon-wrapper">
                  <img className="finder-folder-icon-img" src="/MacIcons/Folder.svg" alt="folder" draggable={false} />
                </div>
                <span className="finder-folder-name">{cat.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
