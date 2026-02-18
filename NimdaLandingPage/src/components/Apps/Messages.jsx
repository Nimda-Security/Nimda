'use client';
import React, { useState } from "react";

export default function Messages({ icon, trafficLights, onDragHandle }) {
  const [selectedChat, setSelectedChat] = useState("NIMDA 동아리방");
  const { contacts, conversations } = icon.content;
  const chatMessages = conversations[selectedChat] || [];

  return (
    <div className="window-messages-content">
      <div className="messages-sidebar" onMouseDown={onDragHandle}>
        {trafficLights}
        <div className="messages-search-bar">
          <input
            type="text"
            className="messages-search-input"
            placeholder="🔍 검색"
            readOnly
          />
        </div>
        {contacts.map((c) => (
          <button
            key={c.name}
            className={`messages-contact ${selectedChat === c.name ? "active" : ""}`}
            onClick={() => setSelectedChat(c.name)}
          >
            <span className="messages-avatar">{c.avatar}</span>
            <div className="messages-contact-info">
              <span className="messages-contact-name">{c.name}</span>
              <div className="messages-contact-meta">
                <span className="messages-contact-day">{c.day}</span>
                <span className="messages-contact-preview">
                  {conversations[c.name]?.[conversations[c.name].length - 1]?.text.substring(0, 20)}...
                </span>
              </div>
            </div>
            {c.unread > 0 && <span className="messages-unread">{c.unread}</span>}
          </button>
        ))}
      </div>
      <div className="messages-main">
        <div className="messages-header">
          <span className="messages-header-label">받는 사람:</span>
          <span className="messages-header-name">{selectedChat}</span>
        </div>
        <div className="messages-body">
          {chatMessages.map((msg, i) => {
            const prev = chatMessages[i - 1];
            const isSameSender = prev && prev.isMe === msg.isMe && prev.sender === msg.sender;
            return (
              <div key={i} className={`message-row ${msg.isMe ? "me" : "other"} ${isSameSender ? "consecutive" : ""}`}>
                {!msg.isMe && !isSameSender && <span className="message-sender">{msg.sender}</span>}
                <div className={`message-bubble ${msg.isMe ? "me" : "other"}`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>
        <div className="messages-input-bar">
          <input type="text" placeholder="iMessage" className="messages-input" readOnly />
        </div>
      </div>
    </div>
  );
}
