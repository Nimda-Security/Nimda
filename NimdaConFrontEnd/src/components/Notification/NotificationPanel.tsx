import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NotificationItem, {
  type NotificationItemProps,
  type NotificationType,
} from "./NotificationItem";
import {
  notificationApi,
  type NotificationResponse,
} from "@/api/notification";

type Tab = "unread" | "read";

interface NotificationPanelProps {
  onClose: () => void;
  refreshKey?: number;
}

function parseNotificationType(message: string): NotificationType {
  if (message.includes("좋아합니다")) return "like";
  if (message.includes("댓글")) return "comment";
  if (message.includes("공지")) return "system";
  return "system";
}

function formatTime(createdAt: string): string {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }
  return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function parseMessage(raw: string): { message: string; preview?: string } {
  if (!raw) return { message: "" };
  const idx = raw.lastIndexOf("-");
  if (idx === -1) return { message: raw };
  return { message: raw.slice(0, idx), preview: raw.slice(idx + 1) };
}

function toItemProps(n: NotificationResponse): NotificationItemProps {
  const { message, preview } = parseMessage(n.message || "");
  return {
    id: n.id,
    type: parseNotificationType(n.message || ""),
    message,
    preview,
    senderNickName: n.senderNickName ?? undefined,
    url: n.url ?? undefined,
    isRead: n.isRead,
    time: formatTime(n.createdAt),
  };
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose, refreshKey }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("unread");
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = activeTab === "unread"
          ? await notificationApi.getUnReadNotifications()
          : await notificationApi.getNotifications();
      const pureData = Array.isArray(data) ? data : (data as any)?.notifications || [];
      setNotifications(pureData);
    } catch (error) {
      console.error("알림 fetch 에러:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications, refreshKey]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  const handleItemClick = async (id: number) => {
    const target = notifications.find((n) => n.id === id);
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* ignore */ }
    if (target?.url) { onClose(); navigate(target.url); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setMenuOpen(false);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
  };

  const filteredNotifications = Array.isArray(notifications)
    ? (activeTab === "read" ? notifications.filter((n) => n?.isRead) : notifications)
    : [];

  const tabs: { key: Tab; label: string }[] = [
    { key: "unread", label: "새 알림" },
    { key: "read", label: "읽음" },
  ];

  return (
    <div className="w-[360px] bg-[#f5f5f5] rounded-[12px] shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="relative bg-[#ffffff] border-b border-[#ececec] h-[100px] flex flex-col justify-between">
        <div className="relative w-full h-[60px]">
          <span
            className="absolute font-bold text-[#0c0c0c] text-[18px] flex items-center"
            style={{ left: '16px', top: '12px', width: '40px', height: '24px', lineHeight: '24px', whiteSpace: 'nowrap' }}
          >
            알림
          </span>
          <div className="absolute" style={{ right: '16px', top: '12px' }} ref={menuRef}>
            <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setMenuOpen((v) => !v)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#666"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 bg-white rounded-[8px] shadow-lg z-20 py-1.5 border border-gray-100 min-w-[140px]">
                <button className="px-4 py-2 text-[13px] text-[#333] hover:bg-pink-50 hover:text-[#d97399] w-full text-left" onClick={handleMarkAllRead}>모두 읽음 처리</button>
              </div>
            )}
          </div>
        </div>
        <div className="flex w-full px-4">
          {tabs.map((tab) => (
            <button key={tab.key} className={`flex-1 pb-2.5 text-[14px] font-semibold transition-all ${activeTab === tab.key ? "text-[#d97399] border-b-[3px] border-[#d97399]" : "text-[#a3a3a3] border-b-[3px] border-transparent"}`} onClick={() => setActiveTab(tab.key)}>
              {tab.label}
              {tab.key === "unread" && notifications.filter(n => !n.isRead).length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-pink-100 text-pink-600 text-[10px] rounded-full">{notifications.filter(n => !n.isRead).length}</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col bg-white min-h-[120px] max-h-[420px] overflow-y-auto scrollbar-hide">
        <div className="flex flex-col">
          {filteredNotifications.map((n, index) => (
            <div key={n.id} style={{ marginTop: index === 0 ? '16px' : '12px', marginLeft: '12px', marginBottom: index === filteredNotifications.length - 1 ? '16px' : '0px' }}>
              <NotificationItem {...toItemProps(n)} onClick={handleItemClick} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;