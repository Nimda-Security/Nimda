'use client';
import React from "react";

export default function Sticker({ icon, onDragHandle, onClose }) {
  const { intro, sub, features, desc } = icon.content;
  
  return (
    <div className="window-sticker-content">
      <div className="sticker-titlebar" onMouseDown={onDragHandle}>
        <button className="sticker-close-btn" onClick={onClose} aria-label="닫기" />
      </div>
      <div className="sticker-note-body">
        <h3 className="sticker-heading">{intro}</h3>
        <p className="sticker-sub">{sub}</p>
        <ul className="sticker-list">
          {features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        <p className="sticker-desc-text">
          {desc}
        </p>
      </div>
    </div>
  );
}
