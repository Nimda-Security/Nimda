import React from 'react';

interface TabMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabMenu: React.FC<TabMenuProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: 'profile', label: '회원정보' },
    { key: 'my_posts', label: '작성글' },
    { key: 'my_comments', label: '작성 댓글' },
    { key: 'liked_posts', label: '좋아요한 글' },
    { key: 'points', label: '마일리지' },
  ];

  return (
    <div className="w-full flex items-center gap-8 border-b border-[#e5e5e5] bg-transparent">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              rowGap: '12px',
              paddingBottom: 0,
              lineHeight: 1.25,
            }}
            className={`text-[16px] transition-all whitespace-nowrap font-['Pretendard'] ${
              isActive
                ? 'text-[#d97399] font-bold'
                : 'text-[#0c0c0c] font-medium hover:text-[#525252]'
            }`}
          >
            <span>{tab.label}</span>
            <div
              style={{ marginBottom: '-1px' }}
              className={`w-full h-[3px] ${
                isActive ? 'bg-[#D97399]' : 'bg-transparent'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default TabMenu;
