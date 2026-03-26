import React, { useState, useEffect, useCallback } from "react";
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


  const fetchNotifications = useCallback(async () => {
    try {
      const data = activeTab === "unread"
          ? await notificationApi.getUnReadNotifications()
          : await notificationApi.getNotifications();
      const pureData = Array.isArray(data) ? data : (data as any)?.notifications || [];
      setNotifications(pureData);
    } catch (error) {
      console.error("알림 fetch 에러:", error);
      setNotifications([]);
    }
  }, [activeTab]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications, refreshKey]);



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
      await fetchNotifications();
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
            style={{ left: '20px', top: '16px', width: '40px', height: '24px', lineHeight: '24px', whiteSpace: 'nowrap' }}
          >
            알림
          </span>
          <div className="absolute flex items-center" style={{ right: '16px', top: '12px', height: '24px' }}>
            <button 
              className="text-[12px] font-medium text-[#888] hover:text-[#555] transition-colors" 
              onClick={handleMarkAllRead}
            >
              모두 읽음
            </button>
          </div>
        </div>
        <div className="flex w-full px-4 h-[32px]">
          {tabs.map((tab) => (
            <button 
              key={tab.key} 
              className={`flex-1 flex items-start justify-center font-semibold transition-all ${activeTab === tab.key ? "text-[#d97399] border-b-[3px] border-[#d97399]" : "text-[#a3a3a3] border-b-[3px] border-transparent"}`} 
              onClick={() => setActiveTab(tab.key)}
            >
              <div className="flex items-center gap-1">
                <span className="text-[14px]">{tab.label}</span>
                {tab.key === "unread" && notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="px-1.5 py-0.5 bg-pink-100 text-pink-600 text-[10px] rounded-full">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col bg-white min-h-[120px] max-h-[420px] overflow-y-auto scrollbar-hide">
        {filteredNotifications.length === 0 ? (
          <div className="flex items-center justify-center flex-1 min-h-[120px]">
            <span className="text-[14px] text-[#bcbcbc]">아직 내용이 없습니다.</span>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 gap-3 w-full">
            {filteredNotifications.map((n) => (
              <NotificationItem key={n.id} {...toItemProps(n)} onClick={handleItemClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;