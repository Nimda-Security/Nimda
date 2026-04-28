import React, { useEffect, useRef, useState } from "react";
import ProfileSummary from "./ProfileSummary";
import Avatar from "@/components/Avatar/Avatar";
import TabMenu from "@/domains/User/MyPage/Point/Components/TabMenu";
import { requestPresignedUpload, putFileToPresignedUrl } from "@/api/attachments";
import { updateProfileImageAPI } from "@/api/auth";

interface ProfileHeaderProps {
  userInfo: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onProfileImageChange?: (newUrl: string) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userInfo, activeTab, setActiveTab, onProfileImageChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  const handleAvatarClick = () => {
    if (uploading) return;
    setShowAvatarMenu((prev) => !prev);
  };

  const handleProfileImageEditClick = () => {
    setShowAvatarMenu(false);
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleProfileDecorationClick = () => {
    setShowAvatarMenu(false);
    alert("프로필 장식 수정 기능은 다음 단계에서 연결됩니다.");
  };

  useEffect(() => {
    if (!showAvatarMenu) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target as Node)
      ) {
        setShowAvatarMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showAvatarMenu]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일만 허용
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    // 10MB 제한
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    setUploading(true);
    try {
      // 1. Presigned URL 발급
      const presigned = await requestPresignedUpload("profile", file.name);
      if (!presigned.ok) {
        alert(presigned.message);
        return;
      }

      // 2. S3에 직접 업로드
      const upload = await putFileToPresignedUrl(presigned.data.uploadUrl, file, file.type);
      if (!upload.ok) {
        alert(upload.message);
        return;
      }

      // 3. 백엔드에 S3 키 저장
      const result = await updateProfileImageAPI(presigned.data.key);
      if (result.success && result.profileImageUrl) {
        onProfileImageChange?.(result.profileImageUrl);
      } else {
        alert(result.message);
      }
    } catch {
      alert("프로필 이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
      // input 초기화 (같은 파일 재선택 가능)
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-[36px]">
      {/* 프로필 섹션: 유저 이미지 160px + 정보 */}
      <div className="inline-flex pl-8 pr-[510px] items-start gap-6">
        <div ref={avatarMenuRef} className="relative">
          <button
            type="button"
            className="relative cursor-pointer group"
            onClick={handleAvatarClick}
            aria-haspopup="menu"
            aria-expanded={showAvatarMenu}
          >
            <Avatar
              src={userInfo?.profileImage}
              size={96}
              className={`transition-opacity ${
                uploading ? "opacity-50" : "group-hover:opacity-80"
              }`}
            />
            {/* 호버 시 카메라 오버레이 */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>

          {showAvatarMenu && (
            <div
              className="absolute left-[112px] top-1/2 z-20 flex min-w-[244px] -translate-y-1/2 flex-col gap-2 rounded-[16px] border border-[#E5E5E5] bg-[rgba(255,255,255,0.96)] p-3 shadow-[0_18px_40px_rgba(12,12,12,0.14)] backdrop-blur-[10px]"
              style={{
                minWidth: "196px",
                padding: "8px",
                gap: "6px",
                boxSizing: "border-box",
              }}
              role="menu"
            >
              <div
                aria-hidden="true"
                className="absolute left-0 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-b border-[#E5E5E5] bg-[rgba(255,255,255,0.96)]"
              />
              <button
                type="button"
                className="flex w-full items-center rounded-[12px] text-left transition-colors hover:bg-[#F8F8F8]"
                style={{
                  padding: "12px 14px",
                  boxSizing: "border-box",
                }}
                onClick={handleProfileImageEditClick}
                role="menuitem"
              >
                <span className="text-[14px] font-semibold text-[#0C0C0C]">
                  프로필 사진 수정
                </span>
              </button>
              <button
                type="button"
                className="flex w-full items-center rounded-[12px] text-left transition-colors hover:bg-[#F8F8F8]"
                style={{
                  padding: "12px 14px",
                  boxSizing: "border-box",
                }}
                onClick={handleProfileDecorationClick}
                role="menuitem"
              >
                <span className="text-[14px] font-semibold text-[#0C0C0C]">
                  장식 수정
                </span>
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <ProfileSummary userInfo={userInfo} />
      </div>

      {/* 탭 메뉴 */}
      <TabMenu activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default ProfileHeader;
