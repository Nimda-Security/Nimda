import React from "react";

export interface ContentListItemData {
  id: number;
  text: string;
  likeCount: number;
  commentCount?: number;
  date: string;
  thumbnailUrl?: string;
}

interface ContentListItemProps {
  item: ContentListItemData;
  checked: boolean;
  onToggle: () => void;
  isLast?: boolean;
  onClick?: () => void;
}

const ContentListItem: React.FC<ContentListItemProps> = ({ item, checked, onToggle, isLast, onClick }) => {
  return (
    <div
      className={`relative w-full h-[80px] flex items-center transition-colors ${
        checked ? "bg-[#fdf2f4]" : "bg-[#f5f5f5]"
      } ${!isLast ? "border-b border-[#d4d4d4]" : ""}`}
      onClick={onClick} // 클릭 시 이동을 위해 추가
    >
      {/* 1. 체크박스 영역 (Left 15px + 여백 반영) */}
      <div
              style={{
                  display: 'flex',
                  width: '28px',
                  height: '28px',
                  justifyContent: 'center',  // 가로 중앙
                  alignItems: 'center',      // 세로 중앙
                  aspectRatio: '1/1',
                  flexShrink: 0,
                  color: '#BCBCBC',
                  marginLeft: '16px',
                  marginTop: 'auto',         // 추가: 위쪽 여백 자동
                  marginBottom: 'auto'      // 추가: 아래쪽 여백 자동

                }}

            >
              <img
                src="/chevron-right.svg"
                alt="이동"
                className="w-5 h-5 opacity-40" // 크기와 투명도는 디자인에 맞게 조절하세요
                style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain', // 아이콘이 잘리지 않게 비율 유지하며 꽉 채움
                      opacity: 0.4
                    }}
              />
            </div>

      {/* 2. 썸네일 (Left 62px 부근 배치 - 제목 Left 88px 기준 앞쪽) */}
      {item.thumbnailUrl && (
        <div className="absolute left-[54px] top-1/2 -translate-y-1/2 w-[24px] h-[24px] rounded overflow-hidden flex-shrink-0">
          <img
            src={item.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 3. 게시글 제목 */}
      <p
        className="absolute truncate"
        style={{
          left: '88px',
          top: '9px',
          width: '258px',
          height: '21px',
          color: '#0C0C0C',
          fontFamily: 'Pretendard',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: '150%',
          letterSpacing: '0%',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {item.text}
      </p>

      {/* 4. 댓글 수 + 좋아요 수 (제목 아래 6px 간격: 9px + 21px + 6px = Top 36px) */}
      <div
        className="absolute flex items-center gap-x-[12px]"
        style={{ left: '88px', top: '36px' }}
      >
        {item.commentCount !== undefined && (
          <div className="flex items-center gap-x-[4px]">
            {/* 검은색 SVG를 파란색(#4A7FCC)으로 변경하는 필터 적용 */}
            <div className="w-[14px] h-[14px] overflow-hidden flex items-center justify-center relative">
              <img
                src="/NotificationComment.svg"
                alt="댓글"
                className="absolute w-[14px] h-[14px] max-w-none"
                style={{
                  left: '-20px',
                  filter: 'drop-shadow(#4A7FCC 20px 0)',
                }}
              />
            </div>
            <span className="text-[12px] font-bold text-[#4A7FCC] leading-none">
              {item.commentCount}
            </span>
          </div>
        )}

        <div className="flex items-center gap-x-[4px]">
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
            <path d="M7 11.5L1.2275 6.09C0.4375 5.3 0 4.26 0 3.15C0 0.93 1.7825 0 3.5 0C4.9525 0 6.265 0.795 7 2.0475C7.735 0.795 9.0475 0 10.5 0C12.2175 0 14 0.93 14 3.15C14 4.26 13.5625 5.3 12.7725 6.09L7 11.5Z" fill="#D64454"/>
          </svg>
          <span className="text-[12px] font-bold text-[#D64454] leading-none">
            {item.likeCount}
          </span>
        </div>
      </div>

      {/* 5. 날짜 (우측 끝 정렬) */}
      <div className="absolute right-[15px] top-[12px] flex-shrink-0">
        <span className="text-[12px] font-normal text-[#a3a3a3] whitespace-nowrap">
          {item.date}
        </span>
      </div>
    </div>
  );
};

export default ContentListItem;