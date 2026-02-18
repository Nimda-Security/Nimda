'use client';
import React from "react";
import { DOCK_ITEMS } from "../../data/constants";

export default function Dock({ onItemClick, openWindows }) {
  const isOpen = (id) => openWindows.some(w => w.id === id);

  return (
    <div className="dock-wrapper">
      <div className="dock">
        {DOCK_ITEMS.map((item, index) => (
          <React.Fragment key={item.id}>
            {index === 1 && <div className="dock-separator" />}
            <div className="dock-item-container">
              <button
                className="dock-item"
                onClick={() => onItemClick(item.action)}
              >
                <img src={item.icon} alt={item.label} className="dock-icon-img" />
                <span className="dock-tooltip">{item.label}</span>
              </button>
              <div className={`dock-dot${isOpen(item.id) ? ' dock-dot--active' : ''}`} />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
