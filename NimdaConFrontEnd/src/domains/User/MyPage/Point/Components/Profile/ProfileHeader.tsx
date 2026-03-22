import React from "react";
import ProfileSummary from "./ProfileSummary";
import TabMenu from "@/domains/User/MyPage/Point/Components/TabMenu";
interface ProfileHeaderProps {
  userInfo: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userInfo, activeTab, setActiveTab }) => {
  return (
    <div className="w-full flex flex-col gap-[36px]">
      {/* 프로필 섹션: 유저 이미지 160px + 정보 */}
      <div className="inline-flex pl-8 pr-[510px] items-start gap-6">
        <img
          src={userInfo.profileImage}
          alt="Profile"
          className="w-[96px] h-[96px] rounded-full object-cover border border-gray-100"
        />
        <ProfileSummary userInfo={userInfo} />
      </div>

      {/* 탭 메뉴 */}
      <TabMenu activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default ProfileHeader;