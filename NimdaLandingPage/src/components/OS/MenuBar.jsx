'use client';
import React, { useEffect, useState } from "react";

export default function MenuBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
      const day = dayNames[now.getDay()];
      const hours = now.getHours();
      const ampm = hours < 12 ? "오전" : "오후";
      const h12 = hours % 12 || 12;
      const fmt = `${now.getMonth() + 1}월 ${now.getDate()}일 (${day}) ${ampm} ${h12}:${String(now.getMinutes()).padStart(2, "0")}`;
      setTime(fmt);
    };
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="menubar">
      <div className="menubar-left">
        <span className="menubar-apple">
          <img src="/nimdalogo1.png" alt="" className="menubar-logo" />
        </span>
        <span className="menubar-app-name">NIMDA</span>
        <span className="menubar-menu-item">파일</span>
        <span className="menubar-menu-item">편집</span>
        <span className="menubar-menu-item">보기</span>
        <span className="menubar-menu-item">도움말</span>
      </div>
      <div className="menubar-right">
        <div className="menubar-battery-group">
          <span className="menubar-battery-text">100%</span>
          <img src="/MacIcons/battery_full.svg" alt="배터리" className="menubar-battery" />
        </div>
        <img src="/MacIcons/wifi.svg" alt="Wi-Fi" className="menubar-wifi" />
        <span className="menubar-time">{time}</span>
      </div>
    </div>
  );
}
