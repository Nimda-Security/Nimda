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
            <span className="finder-sidebar-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </span>최근 항목
          </div>
          <div className="finder-sidebar-item">
            <span className="finder-sidebar-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </span>응용 프로그램
          </div>
          <div className="finder-sidebar-item active">
            <span className="finder-sidebar-icon">
              <svg style={{ transform: 'scale(0.9)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </span>동아리활동
          </div>
          <div className="finder-sidebar-item">
            <span className="finder-sidebar-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12l4 4 4-4"/></svg>
            </span>다운로드
          </div>
        </div>
        <div className="finder-sidebar-section cloud-section">
          <div className="finder-sidebar-title">NIMDA Cloud</div>
          <div className="finder-sidebar-item">
            <span className="finder-sidebar-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </span>공유
          </div>
          <div className="finder-sidebar-item">
            <span className="finder-sidebar-icon">
              <svg viewBox="0 -1 26 26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H6c-2.2 0-4-1.8-4-4s1.8-4 4-4c.3 0 .6.1.9.2A6.004 6.004 0 0 1 12 4a6.003 6.003 0 0 1 5.9 5.3c.7-.2 1.4-.3 2.1-.3 2.8 0 5 2.2 5 5s-2.2 5-5 5z" /></svg>
            </span>NIMDA Drive
          </div>
          <div className="finder-sidebar-item">
            <span className="finder-sidebar-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </span>데스크탑
          </div>
          <div className="finder-sidebar-item">
            <span className="finder-sidebar-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </span>문서
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
