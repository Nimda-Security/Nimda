import React, { useState, useRef, useEffect } from "react";
import NotificationPanel from "./NotificationPanel";
import { notificationApi } from "@/api/notification";
import { isLoggedIn } from "@/api/auth";

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // 마운트 시 초기 읽지 않은 알림 상태 확인
  useEffect(() => {
    if (!isLoggedIn()) return;
    notificationApi
      .checkUnreadStatus()
      .then((res) => {
        setHasUnread(res.hasUnRead ?? false);
      })
      .catch(() => {});
  }, []);

  // SSE 구독 — 로그인 상태일 때 실시간 알림 수신
  useEffect(() => {
    if (!isLoggedIn()) return;

    const controller = notificationApi.subscribe(() => {
      setHasUnread(true);
      setRefreshKey((k) => k + 1); // 패널이 열려있으면 리스트 갱신 트리거
    });

    return () => controller?.abort();
  }, []);

  // 패널이 닫힐 때 읽음 상태 재확인 (열람 후 빨간 점 갱신)
  useEffect(() => {
    if (!open) {
      notificationApi
        .checkUnreadStatus()
        .then((res) => {
          setHasUnread(res.hasUnRead ?? false);
        })
        .catch(() => {});
    }
  }, [open]);

  // 클릭 시 외부 영역을 클릭하면 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div
      className="relative inline-block"
      ref={ref}
    >
      <button
        type="button"
        title="알림"
        className={`relative flex items-center justify-center border-none cursor-pointer outline-none rounded-full transition-colors p-2 ${
          open ? "bg-[#f1f1f1]" : "bg-transparent"
        }`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <img
          src="/bell.svg"
          alt="알림"
          className="w-6 h-6"
        />

        {hasUnread && (
          <img
            src="/Ellipse-bell.svg"
            alt="새 알림"
            className="absolute top-0 right-0 w-4 h-4"
          />
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