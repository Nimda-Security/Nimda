'use client';
import React from "react";

export default function TextEditor({ icon, trafficLights, onDragHandle }) {
  return (
    <div className="window-text-content">
      <div className="text-titlebar" onMouseDown={onDragHandle}>
        {trafficLights}
        <span className="text-titlebar-title">{icon.windowTitle}</span>
      </div>
      <pre className="text-file">{icon.content}</pre>
    </div>
  );
}
