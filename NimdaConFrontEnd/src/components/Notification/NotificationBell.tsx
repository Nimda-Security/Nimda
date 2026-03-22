import React, { useState, useRef, useEffect } from "react";
import NotificationPanel from "./NotificationPanel";
import { notificationApi } from "@/api/notification";
import { isLoggedIn } from "@/api/auth";

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // SSE 구독 — 로그인 상태일 때 실시간 알림 수신
  useEffect(() => {
    if (!isLoggedIn()) return;

    const controller = notificationApi.subscribe(() => {
      setHasUnread(true);
      setRefreshKey((k) => k + 1); // 패널이 열려있으면 리스트 갱신 트리거
    });

    return () => controller?.abort();
  }, []);

  // 알림 상태 체크 (창이 열릴 때만)
  useEffect(() => {
    if (open) {
      notificationApi
        .checkUnreadStatus()
        .then((res) => {
          setHasUnread(res.hasUnRead ?? false);
        })
        .catch(() => {});
    }
  }, [open]);

  return (
    <div
      className="relative inline-block"
      ref={ref}
      // 마우스가 이 영역(아이콘 + 패널 전체)에 들어오면 열기
      onMouseEnter={() => setOpen(true)}
      // 마우스가 이 영역을 완전히 벗어나면 닫기
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        title="알림"
        className={`
          relative flex items-center justify-center p-2 rounded-full border-none cursor-pointer outline-none transition-colors
          ${open ? 'bg-black/10' : 'bg-black/5 hover:bg-black/10'}
        `}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {hasUnread && (
          <span className="absolute top-[6px] right-[6px] w-2 h-2 bg-[#D64454] rounded-full border border-white" />
        )}
      </button>

      {/* 패널 위치 설정:
        아이콘과 패널 사이에 미세한 공백이 있으면 마우스 이동 중 창이 닫힐 수 있습니다.
        top-[calc(100%)] 처럼 딱 붙여주거나 투명한 padding을 주는 것이 좋습니다.
      */}
      {open && (
        <div className="absolute right-0 top-full pt-2 z-50">
          <NotificationPanel onClose={() => setOpen(false)} refreshKey={refreshKey} />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;