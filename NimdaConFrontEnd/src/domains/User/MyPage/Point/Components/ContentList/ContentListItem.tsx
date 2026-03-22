import React from "react";
import CheckBox from "./CheckBox";

export interface ContentListItemData {
  id: number;
  text: string;
  likeCount: number;
  date: string; // 이미지와 같이 "MM.DD" 형식의 문자열이 들어온다고 가정
}

interface ContentListItemProps {
  item: ContentListItemData;
  checked: boolean;
  onToggle: () => void;
  isLast?: boolean;
}
const ContentListItem: React.FC<ContentListItemProps> = ({ item, checked, onToggle, isLast }) => {
  return (
    <div
      className={`flex items-center h-[52px] px-[15px] transition-colors bg-transparent ${
        checked ? "bg-[#fdf2f4]" : "bg-white"
      } ${!isLast ? "border-b border-[#eeeeee]" : ""}`}
    >

        <div className="w-[15px] flex-shrink-0" />

      {/* 1. 체크박스: 부모 px-15 때문에 왼쪽 끝에서 15px 지점에 위치 */}
      <div className="flex-shrink-0">
        <CheckBox checked={checked} onChange={onToggle} />
      </div>
        <div className="w-[16px] flex-shrink-0" />

      {/* 2. 본문 영역: 디자인처럼 텍스트를 오른쪽으로 확 밀어주기 위해 ml-[20px] 적용 */}
      <div className="flex items-center flex-1 min-w-0">
              <p
                className="truncate"
                style={{
                  color: '#0C0C0C',
                  fontFamily: 'Pretendard',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '150%'
                }}
              >
                {item.text}
              </p>

        <div className="w-[20px] flex-shrink-0" />

        {/* 좋아요: 텍스트 바로 옆에 붙임 */}
        <div className="ml-[8px] flex items-center gap-x-[4px] flex-shrink-0 text-[#ed64a6]">
          <img src="/heart.svg" alt="like" className="w-[14px] h-[14px]" />
          <span className="text-[13px] font-medium leading-none mb-[0.5px]">
          <div className="w-[4px] flex-shrink-0" />
            {item.likeCount}
          </span>
        </div>
      </div>

      {/* 3. 날짜: 오른쪽 끝(px-15)에 위치 */}
      <div className="ml-[16px] flex-shrink-0">
        <span className="text-[13px] font-normal text-[#bdbdbd] whitespace-nowrap">
          {item.date}
        </span>
      </div>
      <div className="w-[15px] flex-shrink-0" />
    </div>
  );
};

export default ContentListItem;