// Profile/ProfileHeader.tsx

import React from "react";
import ProfileSummary from "./ProfileSummary";

interface ProfileHeaderProps {
  userInfo: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userInfo, activeTab, setActiveTab }) => {
  return (
    /* [수정 내용]
       - border, border-[#e5e7eb], rounded-xl, shadow-sm 제거
       - 배경색도 필요 없다면 bg-white 대신 bg-transparent로 변경 가능
    */
    <div className="w-full bg-transparent flex flex-col pt-8">

      {/* 상단: 이미지 + 요약정보 */}
      <div className="inline-flex pl-8 pr-[510px] items-start gap-6">
        <img
          src={userInfo.profileImage}
          alt="Profile"
          className="w-[96px] h-[96px] rounded-full object-cover border border-gray-100"
        />
        <ProfileSummary userInfo={userInfo} />
      </div>

      {/* 하단: 탭 메뉴 (테두리는 여기 하단에만 border-b로 유지) */}
      <div className="flex gap-8 border-b border-[#f1f1f1] px-8 mt-10">
        {[
          { key: "profile", label: "회원정보" },
          { key: "my_posts", label: "작성글" },
          { key: "my_comments", label: "작성 댓글" },
          { key: "commented_posts", label: "댓글단 글" },
          { key: "liked_posts", label: "좋아요한 글" },
          { key: "points", label: "마일리지" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-4 text-[15px] font-medium transition-all relative whitespace-nowrap ${
              activeTab === tab.key ? "text-[#d97399] font-bold" : "text-[#8e8e8e] hover:text-gray-600"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#d97399]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileHeader;