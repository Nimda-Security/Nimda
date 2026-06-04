import React, { useEffect, useRef, useState } from "react";
import ProfileSummary from "./ProfileSummary";
import Avatar from "@/components/Avatar/Avatar";
import TabMenu from "@/domains/User/MyPage/Point/Components/TabMenu";
import { requestPresignedUpload, putFileToPresignedUrl } from "@/api/attachments";
import {
  updateProfileDecorationAPI,
  updateProfileImageAPI,
} from "@/api/auth";
import {
  PROFILE_DECORATIONS,
  setProfileDecorationOptions,
} from "@/constants/profileDecorations";
import {
  getMyProfileDecorationsAPI,
  type ProfileDecorationOption,
} from "@/api/profileDecorations";

interface ProfileHeaderProps {
  userInfo: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onProfileImageChange?: (newUrl: string) => void;
  onProfileDecorationChange?: (newDecoration: string | null) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userInfo,
  activeTab,
  setActiveTab,
  onProfileImageChange,
  onProfileDecorationChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showDecorationModal, setShowDecorationModal] = useState(false);
  const [decorationSaving, setDecorationSaving] = useState(false);
  const [decorationOptions, setDecorationOptions] =
    useState<ProfileDecorationOption[]>(PROFILE_DECORATIONS);

  const handleAvatarClick = () => {
    if (uploading || decorationSaving) return;
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
    setShowDecorationModal(true);
  };

  useEffect(() => {
    if (!showDecorationModal) return;

    const loadDecorations = async () => {
      const ownedResult = await getMyProfileDecorationsAPI();
      if (ownedResult.success) {
        setDecorationOptions(ownedResult.decorations);
        setProfileDecorationOptions(ownedResult.decorations);
      }
    };

    void loadDecorations();
  }, [showDecorationModal]);

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

  useEffect(() => {
    if (!showDecorationModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !decorationSaving) {
        setShowDecorationModal(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDecorationModal, decorationSaving]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    setUploading(true);
    try {
      const presigned = await requestPresignedUpload("profile", file.name);
      if (!presigned.ok) {
        alert(presigned.message);
        return;
      }

      const upload = await putFileToPresignedUrl(
        presigned.data.uploadUrl,
        file,
        file.type
      );
      if (!upload.ok) {
        alert(upload.message);
        return;
      }

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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDecorationSelect = async (decorationKey: string | null) => {
    if (decorationSaving) return;
    setDecorationSaving(true);
    try {
      const result = await updateProfileDecorationAPI(decorationKey);
      if (result.success) {
        onProfileDecorationChange?.(result.profileDecoration ?? null);
        setShowDecorationModal(false);
      } else {
        alert(result.message);
      }
    } catch {
      alert("프로필 장식 변경 중 오류가 발생했습니다.");
    } finally {
      setDecorationSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-[36px]">
      <div className="inline-flex pl-8 pr-[510px] items-start gap-6 overflow-visible">
        <div ref={avatarMenuRef} className="relative overflow-visible">
          <button
            type="button"
            className="relative inline-flex cursor-pointer group overflow-visible"
            onClick={handleAvatarClick}
            aria-haspopup="menu"
            aria-expanded={showAvatarMenu || showDecorationModal}
          >
            <Avatar
              src={userInfo?.profileImage}
              decorationKey={userInfo?.profileDecoration}
              size={96}
              decorationScale={1.18}
              reserveDecorationSpace
              className={`transition-opacity ${
                uploading ? "opacity-50" : "group-hover:opacity-80"
              }`}
            />
            <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {uploading && (
              <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>

          {showAvatarMenu && (
            <div
              className="absolute left-[112px] top-0 z-20 flex min-w-[220px] flex-col gap-1.5 rounded-[14px] border border-[#E5E5E5] bg-[rgba(255,255,255,0.96)] p-2 shadow-[0_18px_40px_rgba(12,12,12,0.14)] backdrop-blur-[10px]"
              style={{
                minWidth: "220px",
                padding: "8px",
                gap: "6px",
                boxSizing: "border-box",
              }}
              role="menu"
            >
              <div
                aria-hidden="true"
                className="absolute left-0 top-12 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-b border-[#E5E5E5] bg-[rgba(255,255,255,0.96)]"
              />
              <button
                type="button"
                className="flex w-full items-center rounded-[10px] px-[14px] py-[10px] text-left transition-colors hover:bg-[#F8F8F8]"
                style={{
                  padding: "10px 14px",
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
                className="flex w-full items-center rounded-[10px] px-[14px] py-[10px] text-left transition-colors hover:bg-[#F8F8F8]"
                style={{
                  padding: "10px 14px",
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

      {showDecorationModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
          role="presentation"
          onMouseDown={() => {
            if (!decorationSaving) setShowDecorationModal(false);
          }}
        >
          <div
            className="w-full max-w-[680px] rounded-[22px] border border-[#E5E5E5] bg-white shadow-[0_24px_70px_rgba(12,12,12,0.2)]"
            style={{ padding: "32px", boxSizing: "border-box" }}
            role="dialog"
            aria-modal="true"
            aria-label="프로필 장식 선택"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-6"
              style={{ marginBottom: "28px" }}
            >
              <div>
                <p className="text-[19px] font-semibold leading-[28px] text-[#0C0C0C]">
                  프로필 장식
                </p>
                <p
                  className="text-[13px] leading-[20px] text-[#8E8E8E]"
                  style={{ marginTop: "12px" }}
                >
                  방문자, 게시글, 댓글에 같이 표시됩니다.
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[20px] leading-none text-[#777] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setShowDecorationModal(false)}
                disabled={decorationSaving}
                aria-label="프로필 장식 선택 닫기"
              >
                ×
              </button>
            </div>

            {decorationSaving && (
              <div
                className="rounded-[10px] bg-[#FFF5F8] text-[12px] font-medium text-[#D97399]"
                style={{
                  marginBottom: "20px",
                  padding: "12px 16px",
                  boxSizing: "border-box",
                }}
              >
                저장 중...
              </div>
            )}

            <div
              className="rounded-[18px] border border-[#EFEFEF] bg-[#FAFAFA]"
              style={{ padding: "20px", boxSizing: "border-box" }}
            >
              <div
                className="grid grid-cols-4"
                style={{ gap: "16px" }}
              >
                <button
                  type="button"
                  onClick={() => handleDecorationSelect(null)}
                  disabled={decorationSaving}
                  className={`flex min-h-[126px] flex-col items-center justify-center rounded-[14px] border bg-white text-center transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                    !userInfo?.profileDecoration
                      ? "border-[#D97399] bg-[#FFF5F8] shadow-[0_8px_22px_rgba(217,115,153,0.12)]"
                      : "border-[#ECECEC] hover:border-[#D9D9D9] hover:bg-white"
                  }`}
                  style={{ padding: "20px 16px", boxSizing: "border-box" }}
                >
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-[#D9D9D9] bg-[#F8F8F8] text-[18px] font-semibold text-[#B0B0B0]">
                    -
                  </span>
                  <span className="text-[13px] font-semibold leading-[19px] text-[#0C0C0C]">
                    미착용
                  </span>
                  <span className="mt-1 text-[11px] leading-[16px] text-[#8E8E8E]">
                    장식 해제
                  </span>
                </button>

                {decorationOptions.map((decoration) => {
                  const selected = userInfo?.profileDecoration === decoration.key;
                  return (
                    <button
                      key={decoration.key}
                    type="button"
                    onClick={() => handleDecorationSelect(decoration.key)}
                    disabled={decorationSaving}
                      className={`flex min-h-[126px] flex-col items-center justify-center rounded-[14px] border bg-white text-center transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                        selected
                          ? "border-[#D97399] bg-[#FFF5F8] shadow-[0_8px_22px_rgba(217,115,153,0.12)]"
                          : "border-[#ECECEC] hover:border-[#D9D9D9] hover:bg-white"
                      }`}
                      style={{ padding: "20px 16px", boxSizing: "border-box" }}
                    >
                      <span className="relative mb-4 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F6F6F6]">
                        <Avatar
                          size={34}
                          src={userInfo?.profileImage}
                          decorationKey={decoration.key}
                          decorationScale={1.16}
                          className="border-0"
                        />
                      </span>
                      <span className="text-[13px] font-semibold leading-[19px] text-[#0C0C0C]">
                        {decoration.label}
                      </span>
                      <span className="mt-1 text-[11px] leading-[16px] text-[#8E8E8E]">
                        프로필 배지
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <TabMenu activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default ProfileHeader;
