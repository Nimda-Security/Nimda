import React from "react";

interface TabMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabMenu: React.FC<TabMenuProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: "profile", label: "회원정보" },
    { key: "my_posts", label: "작성글" },
    { key: "my_comments", label: "작성 댓글" },
    { key: "commented_posts", label: "댓글단 글" },
    { key: "liked_posts", label: "좋아요한 글" },
    { key: "points", label: "마일리지" },
  ];

  return (
    /* - w-[1136px]: 피그마 가이드 너비
       - h-[32px]: 피그마 가이드 높이
       - border-b: 아래에만 테두리
       - rounded-none: 굴곡 제거
    */
    <div className="w-[1136px] h-[32px] flex gap-8 border-b border-[#f1f1f1] px-[32px] mt-10 rounded-none bg-transparent">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          /* - 활성화 시: #D97399, 16px, Bold(700), leading-[150%]
             - 비활성화 시: 기존 스타일 유지
          */
          className={`h-full pb-2 transition-all relative whitespace-nowrap font-['Pretendard'] ${
            activeTab === tab.key
              ? "text-[#D97399] text-[16px] font-bold leading-[150%]"
              : "text-[#8e8e8e] text-[15px] font-medium hover:text-gray-600"
          }`}
        >
          {tab.label}

          {/* 활성화 시 하단 인디케이터 (핑크색 선) */}
          {activeTab === tab.key && (
            <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#D97399]" />
          )}
        </button>
      ))}
    </div>
  );
};

export default TabMenu;