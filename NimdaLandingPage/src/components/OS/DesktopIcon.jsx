'use client';
import React from "react";

export default function DesktopIcon({ icon, onClick }) {
  return (
    <button
      className="desktop-icon"
      onClick={onClick}
    >
      <img src={icon.icon} alt={icon.label} className="desktop-icon-img" />
      <span className="desktop-icon-label">{icon.label}</span>
    </button>
  );
}
