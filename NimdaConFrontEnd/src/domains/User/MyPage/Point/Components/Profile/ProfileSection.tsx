import React from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileSummary from "./ProfileSummary";

const ProfileSection = ({
  userInfo,
  activeTab,
  setActiveTab,
  onProfileImageChange,
  onProfileDecorationChange,
}: any) => {
  return (
    <ProfileHeader
      userInfo={userInfo}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onProfileImageChange={onProfileImageChange}
      onProfileDecorationChange={onProfileDecorationChange}
    />
  );
};

export default ProfileSection;
