'use client';
import React, { useState } from "react";

export default function Notes({ icon, trafficLights, onDragHandle }) {
  const [selectedNote, setSelectedNote] = useState(0);
  const notes = icon.content.notes;

  return (
    <div className="window-notes-content">
      <div className="notes-sidebar" onMouseDown={onDragHandle}>
        {trafficLights}
        <div className="notes-sidebar-header">
          <span className="notes-count">{notes.length}개의 메모</span>
        </div>
        {notes.map((note, i) => (
          <button
            key={i}
            className={`notes-sidebar-item ${selectedNote === i ? "active" : ""}`}
            onClick={() => setSelectedNote(i)}
          >
            <div className="notes-item-title">{note.title}</div>
            <div className="notes-item-date">{note.date}</div>
            <div className="notes-item-preview">{note.body.substring(0, 40)}...</div>
          </button>
        ))}
      </div>
      <div className="notes-main">
        <div className="notes-header">
          <h2 className="notes-title">{notes[selectedNote].title}</h2>
          <span className="notes-date">{notes[selectedNote].date}</span>
        </div>
        <div className="notes-body">
          {notes[selectedNote].body.split('\n').map((line, i) => (
            <p key={i}>{line || '\u00A0'}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
