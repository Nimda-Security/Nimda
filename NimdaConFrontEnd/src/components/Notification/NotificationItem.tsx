import React from "react";

export type NotificationType = "like" | "comment" | "system";

export interface NotificationItemProps {
  id: number;
  type: NotificationType;
  message: string;
  preview?: string;
  senderNickName?: string;
  senderProfileImage?: string;
  time: string;
  isRead: boolean;
  url?: string;
  onClick?: (id: number) => void;
}

// 1. 제공해주신 SVG 경로 적용
const HeartIcon = () => (
  <img src="/NotificationHeart.svg" alt="좋아요" className="w-[16px] h-[16px]" />
);

const CommentIcon = () => (
  <img src="/NotificationComment.svg" alt="댓글" className="w-[16px] h-[16px]" />
);

const SystemIcon = () => (
  <img src="/nimdalogo_b 1.svg" alt="공지" className="w-[16px] h-[16px]" />
);

const typeIconMap: Record<NotificationType, React.FC> = {
  like: HeartIcon,
  comment: CommentIcon,
  system: SystemIcon,
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  type,
  message,
  preview,
  senderNickName,
  senderProfileImage,
  time,
  isRead,
  onClick,
}) => {
  const Icon = typeIconMap[type];
  const hasNickName = type !== "system" && senderNickName;

  return (
    <button
      onClick={() => onClick?.(id)}
      className={`relative rounded-[10px] bg-[#f5f5f5] shadow-[0px_0px_2px_0px_rgba(0,0,0,0.25)] text-left transition-all hover:brightness-95 ${
        isRead ? "opacity-50" : "opacity-100"
      }`}
      style={{ width: "336px", height: "98px" }}
    >
      {/* 1. 알림 타입 아이콘 (제공된 SVG 적용 영역) */}
      <div className="absolute left-[16px] top-[16px] w-[16px] h-[16px] flex items-center justify-center">
        <Icon />
      </div>

      {/* 2. 프로필 (40, 12, 24x24) */}
      {hasNickName && (
        <div className="absolute left-[40px] top-[12px] w-[24px] h-[24px] rounded-full bg-[#0c0c0c] flex items-center justify-center border border-white overflow-hidden">
          {senderProfileImage ? (
            <img
              src={senderProfileImage}
              alt={senderNickName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.removeAttribute('style');
              }}
            />
          ) : null}
          <span
            className="text-white text-[10px] font-bold leading-none"
            style={senderProfileImage ? { display: 'none' } : {}}
          >
            {senderNickName![0]}
          </span>
        </div>
      )}

      {/* 3. 시간 텍스트 최적화: 우측 상단 정렬로 변경하여 텍스트 잘림 방지 */}
      <span
        className="absolute text-[12px] font-normal text-[#bcbcbc] text-right"
        style={{
          right: '16px',
          top: '12px',
          lineHeight: '18px',
          whiteSpace: 'nowrap'
        }}
      >
        {time}
      </span>

      {/* 4. 본문 영역: 프로필 하단 정렬 및 시간 텍스트와 겹침 방지 */}
      <div
        className="absolute flex flex-col gap-0.5"
        style={{
          left: "40px",
          right: "50px", // 시간 텍스트와 겹침 방지 여백
          top: hasNickName ? "40px" : "36px",
        }}
      >
        <p className="text-[14px] font-bold leading-tight text-[#0c0c0c] truncate">
          {message}
        </p>
        {preview && (
          <p className="text-[13px] font-normal leading-tight text-[#737373] truncate mt-0.5">
            {preview}
          </p>
        )}
      </div>
    </button>
  );
};

export default NotificationItem;