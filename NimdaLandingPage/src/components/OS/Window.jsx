'use client';
import { motion } from "framer-motion";
import React, { useState, useEffect, useCallback } from "react";
import { Terminal, Finder, Gallery, Notes, Messages, Contacts, Sticker, TextEditor } from "../Apps";

function WindowContent({ icon, trafficLights, onDragHandle, onClose }) {
  if (icon.type === "terminal") {
    return <Terminal icon={icon} trafficLights={trafficLights} onDragHandle={onDragHandle} onClose={onClose} />;
  }
  if (icon.type === "text") {
    return <TextEditor icon={icon} trafficLights={trafficLights} onDragHandle={onDragHandle} onClose={onClose} />;
  }
  if (icon.type === "folder") {
    return <Finder icon={icon} trafficLights={trafficLights} onDragHandle={onDragHandle} onClose={onClose} />;
  }
  if (icon.type === "gallery") {
    return <Gallery icon={icon} trafficLights={trafficLights} onDragHandle={onDragHandle} onClose={onClose} />;
  }
  if (icon.type === "notes") {
    return <Notes icon={icon} trafficLights={trafficLights} onDragHandle={onDragHandle} onClose={onClose} />;
  }
  if (icon.type === "messages") {
    return <Messages icon={icon} trafficLights={trafficLights} onDragHandle={onDragHandle} onClose={onClose} />;
  }
  if (icon.type === "contacts") {
    return <Contacts icon={icon} trafficLights={trafficLights} onDragHandle={onDragHandle} onClose={onClose} />;
  }
  if (icon.type === "sticker") {
    return <Sticker icon={icon} trafficLights={trafficLights} onDragHandle={onDragHandle} onClose={onClose} />;
  }
  return null;
}

export default function Window({ icon, zIndex, onClose, onFocus, position }) {
  const [pos, setPos] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('.traffic-btn')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
    onFocus();
  }, [pos, onFocus]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      setPos({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // 윈도우 크기를 타입에 따라 다르게
  const widthClass = icon.type === "messages" ? "window-wide" : icon.type === "gallery" ? "window-wide" : icon.type === "terminal" ? "window-terminal" : icon.type === "folder" ? "window-wide" : icon.type === "contacts" ? "window-wide" : icon.type === "sticker" ? "window-sticker" : "";

  // terminal만 상단바 표시, 나머지는 앱 내부 사이드바에 버튼 배치
  const showTitlebar = icon.type === "terminal";

  // 사이드바에 삽입할 traffic lights 엘리먼트
  const trafficLights = (
    <div className="sidebar-traffic-lights" onMouseDown={handleMouseDown}>
      <button className="traffic-btn close" onClick={onClose} aria-label="닫기">
        <svg width="6" height="6" viewBox="0 0 6 6"><path d="M0 0L6 6M6 0L0 6" stroke="rgba(77,0,0,0.6)" strokeWidth="1.2"/></svg>
      </button>
      <button className="traffic-btn minimize" aria-label="최소화">
        <svg width="8" height="2" viewBox="0 0 8 2"><path d="M0 1H8" stroke="rgba(77,50,0,0.6)" strokeWidth="1.2"/></svg>
      </button>
      <button className="traffic-btn maximize" aria-label="최대화">
        <svg width="6" height="6" viewBox="0 0 6 6"><path d="M0 1.5V5.5H4M1.5 0.5H5.5V4.5" stroke="rgba(0,77,0,0.6)" strokeWidth="1"/></svg>
      </button>
    </div>
  );

  return (
    <motion.div
      className={`finder-window ${widthClass}`}
      style={{ left: pos.x, top: pos.y, zIndex }}
      initial={{ scale: 0.85, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.85, opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      onMouseDown={onFocus}
    >
      {/* Universal Top Drag Region: Allows dragging from top area of ANY window */}
      <div
        className="window-drag-region"
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '24px',
          zIndex: 10,
          cursor: 'default',
        }}
      />

      {showTitlebar && (
        <div className="window-titlebar" onMouseDown={handleMouseDown}>
          <div className="traffic-lights">
            <button className="traffic-btn close" onClick={onClose} aria-label="닫기">
              <svg width="6" height="6" viewBox="0 0 6 6"><path d="M0 0L6 6M6 0L0 6" stroke="rgba(77,0,0,0.6)" strokeWidth="1.2"/></svg>
            </button>
            <button className="traffic-btn minimize" aria-label="최소화">
              <svg width="8" height="2" viewBox="0 0 8 2"><path d="M0 1H8" stroke="rgba(77,50,0,0.6)" strokeWidth="1.2"/></svg>
            </button>
            <button className="traffic-btn maximize" aria-label="최대화">
              <svg width="6" height="6" viewBox="0 0 6 6"><path d="M0 1.5V5.5H4M1.5 0.5H5.5V4.5" stroke="rgba(0,77,0,0.6)" strokeWidth="1"/></svg>
            </button>
          </div>
          <span className="window-title">{icon.windowTitle}</span>
          <div style={{ width: 52 }} />
        </div>
      )}
      <div className={`window-body ${icon.type === "folder" ? "window-body-finder" : icon.type === "sticker" ? "window-body-sticker" : ""}`}>
        <WindowContent icon={icon} trafficLights={trafficLights} onDragHandle={handleMouseDown} onClose={onClose} />
      </div>
    </motion.div>
  );
}
