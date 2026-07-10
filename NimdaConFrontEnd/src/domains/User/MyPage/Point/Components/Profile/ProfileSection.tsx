import type { ComponentProps } from "react";
import ProfileHeader from "./ProfileHeader";

const ProfileSection = ({
  userInfo,
  activeTab,
  setActiveTab,
  onProfileImageChange,
  onProfileDecorationChange,
}: ComponentProps<typeof ProfileHeader>) => {
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
