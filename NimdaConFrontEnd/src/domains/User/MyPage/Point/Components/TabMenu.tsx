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
    { key: "liked_posts", label: "좋아요한 글" },
    { key: "points", label: "마일리지" },
  ];

  return (
    <div className="w-full flex items-center gap-8 border-b border-[#e5e5e5] bg-transparent">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 text-[16px] transition-all relative whitespace-nowrap font-['Pretendard'] ${
              isActive
                ? "text-[#d97399] font-bold"
                : "text-[#0c0c0c] font-medium hover:text-[#525252]"
            }`}
          >
            {tab.label}

            {/* 활성화 시 하단 인디케이터: 보더라인 위에 딱 붙도록 bottom-[-1px] 처리 */}
            {isActive && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#D97399]" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TabMenu;