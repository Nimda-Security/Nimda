'use client';
import React, { useState } from "react";
import { getHangulInitial } from "../../utils/helpers";

export default function Contacts({ icon, trafficLights, onDragHandle }) {
  const [selectedContactId, setSelectedContactId] = useState(0);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const contacts = icon.content;

  const filteredContacts = contacts.filter(c =>
    c.name.includes(contactSearchQuery) || c.role.includes(contactSearchQuery)
  );

  const selected = filteredContacts[selectedContactId] || filteredContacts[0] || {};

  const grouped = filteredContacts.reduce((acc, contact, idx) => {
    const init = getHangulInitial(contact.name);
    if (!acc[init]) acc[init] = [];
    acc[init].push({ ...contact, originalIndex: idx });
    return acc;
  }, {});
  const sortedKeys = Object.keys(grouped).sort();

  return (
    <div className="window-contacts-content">
      <div className="contacts-sidebar" onMouseDown={onDragHandle}>
        {trafficLights}
        <div className="contacts-search-bar">
          <svg className="contacts-search-icon" width="14" height="14" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="3.5" stroke="white" strokeWidth="1.2"/><path d="M8 8L10.5 10.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <input
            type="text"
            placeholder="검색"
            className="contacts-search-input"
            value={contactSearchQuery}
            onChange={(e) => {
              setContactSearchQuery(e.target.value);
              setSelectedContactId(0);
            }}
          />
        </div>
        <div className="contacts-list-container">
          {sortedKeys.map(key => (
            <div key={key}>
              <div className="contacts-section-header">{key}</div>
              {grouped[key].map(c => (
                <button
                  key={c.name}
                  className={`contacts-sidebar-item ${selectedContactId === c.originalIndex ? "active" : ""}`}
                  onClick={() => setSelectedContactId(c.originalIndex)}
                >
                  <span className="contacts-sidebar-name">{c.name}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="contacts-main">
        <div className="contacts-detail-scroll">
          <div className="contacts-profile-top">
            <div className="contacts-avatar-large" style={{ backgroundColor: selected.color || "#8E8E93" }}>
              {selected.avatar}
            </div>
            <div className="contacts-profile-info">
              <h2 className="contacts-name-large">{selected.name}</h2>
              <p className="contacts-role">{selected.role}</p>
            </div>
          </div>

          <div className="contacts-actions">
            <button className="contacts-action-btn">
              <div className="contacts-action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"/></svg>
              </div>
              <span>메시지</span>
            </button>
            <button className="contacts-action-btn">
              <div className="contacts-action-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"/></svg>
              </div>
              <span>통화</span>
            </button>
            <button className="contacts-action-btn">
              <div className="contacts-action-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17 10.5V7C17 6.45 16.55 6 16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5Z"/></svg>
              </div>
              <span>비디오</span>
            </button>
            <button className="contacts-action-btn contacts-action-btn--gray">
              <div className="contacts-action-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"/></svg>
              </div>
              <span>메일</span>
            </button>
          </div>

          <div className="contacts-card">
            <div className="contacts-card-row contacts-card-row--inline">
              <span className="contacts-card-label">전화</span>
              <span className="contacts-card-value link">{selected.phone || ""}</span>
            </div>
            <div className="contacts-card-divider" />
            <div className="contacts-card-row contacts-card-row--inline contacts-row-facetime">
              <span className="contacts-card-label">FaceTime</span>
              <div className="contacts-facetime-icons">
                <div className="contacts-ft-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7C17 6.45 16.55 6 16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5Z"/></svg>
                </div>
                <div className="contacts-ft-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"/></svg>
                </div>
              </div>
            </div>
            <div className="contacts-card-divider" />
            <div className="contacts-card-row contacts-card-row--inline">
              <span className="contacts-card-label">메모</span>
              <span className="contacts-card-value">{selected.memo || ""}</span>
            </div>
          </div>
        </div>

        <div className="contacts-bottom-bar">
          <button className="contacts-bottom-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="contacts-bottom-right">
            <button className="contacts-bottom-btn contacts-bottom-btn--label">편집</button>
            <button className="contacts-bottom-btn contacts-bottom-btn--icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
