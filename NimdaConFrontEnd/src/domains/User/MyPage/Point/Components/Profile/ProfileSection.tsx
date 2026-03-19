import React from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileSummary from "./ProfileSummary";

const ProfileSection = ({ userInfo, activeTab, setActiveTab }: any) => {
  return (
    <ProfileHeader
      userInfo={userInfo}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
};

export default ProfileSection;