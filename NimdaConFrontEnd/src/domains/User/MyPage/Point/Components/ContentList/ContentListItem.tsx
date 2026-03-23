import React from "react";
import CheckBox from "./CheckBox";

export interface ContentListItemData {
  id: number;
  text: string;
  likeCount: number;
  commentCount?: number;
  date: string;
  thumbnailUrl?: string;
  authorNickname?: string;
  authorProfileImage?: string;
}

interface ContentListItemProps {
  item: ContentListItemData;
  checked: boolean;
  onToggle: () => void;
  isLast?: boolean;
  onClick?: () => void;
  /** "checkbox" = 체크박스(삭제용), "arrow" = 화살표(이동용) */
  mode?: "checkbox" | "arrow";
}

const ContentListItem: React.FC<ContentListItemProps> = ({
  item,
  checked,
  onToggle,
  isLast,
  onClick,
  mode = "arrow",
}) => {
  return (
    <div
      className={`w-full h-[80px] flex items-center gap-3 px-4 transition-colors ${
        checked ? "bg-[#fdf2f4]" : "bg-[#f5f5f5]"
      } ${!isLast ? "border-b border-[#d4d4d4]" : ""}`}
      onClick={mode === "arrow" ? onClick : undefined}
      style={mode === "arrow" ? { cursor: "pointer" } : undefined}
    >
      {/* 1. 좌측: 체크박스 또는 화살표 */}
      {mode === "checkbox" ? (
        <div
          className="flex-shrink-0 flex items-center justify-center w-[28px] h-[28px]"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <CheckBox checked={checked} onChange={onToggle} />
        </div>
      ) : (
        <div className="flex-shrink-0 flex items-center justify-center w-[28px] h-[28px]">
          <img
            src="/chevron-right.svg"
            alt="이동"
            className="w-full h-full object-contain opacity-40"
          />
        </div>
      )}

      {/* 2. 썸네일 */}
      {item.thumbnailUrl && (
        <div className="flex-shrink-0 w-[24px] h-[24px] rounded overflow-hidden">
          <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* 3. 중앙 텍스트 영역 */}
      <div
        className="flex-1 flex flex-col justify-center min-w-0 gap-[6px]"
        onClick={
          mode === "checkbox" && onClick
            ? (e) => {
                e.stopPropagation();
                onClick();
              }
            : undefined
        }
        style={mode === "checkbox" && onClick ? { cursor: "pointer" } : undefined}
      >
        <p
          className="truncate text-[14px] font-[500] text-[#0C0C0C] leading-[150%]"
          style={{ fontFamily: "Pretendard" }}
        >
          {item.text}
        </p>
        <div className="flex items-center gap-x-[12px]">
          {item.commentCount !== undefined && (
            <div className="flex items-center gap-x-[4px]">
              <div className="w-[14px] h-[14px] overflow-hidden flex items-center justify-center relative">
                <img
                  src="/NotificationComment.svg"
                  alt="댓글"
                  className="absolute w-[14px] h-[14px] max-w-none"
                  style={{ left: "-20px", filter: "drop-shadow(#4A7FCC 20px 0)" }}
                />
              </div>
              <span className="text-[12px] font-bold text-[#4A7FCC] leading-none">
                {item.commentCount}
              </span>
            </div>
          )}
          <div className="flex items-center gap-x-[4px]">
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
              <path
                d="M7 11.5L1.2275 6.09C0.4375 5.3 0 4.26 0 3.15C0 0.93 1.7825 0 3.5 0C4.9525 0 6.265 0.795 7 2.0475C7.735 0.795 9.0475 0 10.5 0C12.2175 0 14 0.93 14 3.15C14 4.26 13.5625 5.3 12.7725 6.09L7 11.5Z"
                fill="#D64454"
              />
            </svg>
            <span className="text-[12px] font-bold text-[#D64454] leading-none">
              {item.likeCount}
            </span>
          </div>
        </div>
      </div>

      {/* 4. 작성자 정보 */}
      {item.authorNickname && (
        <div className="flex-shrink-0 flex items-center gap-[8px]">
          <div
            className="w-[24px] h-[24px] rounded-full flex-shrink-0 overflow-hidden"
            style={{
              border: "0.2px solid #737373",
              background: item.authorProfileImage ? "transparent" : "#0C0C0C",
            }}
          >
            {item.authorProfileImage && (
              <img
                src={item.authorProfileImage}
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            )}
          </div>
          <span
            className="text-[14px] font-medium text-[#0C0C0C] whitespace-nowrap"
            style={{ fontFamily: "Pretendard" }}
          >
            {item.authorNickname}
          </span>
        </div>
      )}

      {/* 5. 날짜 */}
      <div
        className="flex-shrink-0 text-right text-[12px] font-[400] text-[#A3A3A3] whitespace-nowrap"
        style={{ fontFamily: "Pretendard", lineHeight: "150%" }}
      >
        {item.date}
      </div>
    </div>
  );
};

export default ContentListItem;