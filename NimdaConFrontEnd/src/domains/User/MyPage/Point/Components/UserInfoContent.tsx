import React, { useState, useEffect } from "react";
import { getMyPageInfo, toggleEmailHide } from "@/api/auth";

interface UserData {
  id?: number;
  userId?: string;
  name?: string;
  nickname?: string;
  email?: string;
  universityName?: string;
  major?: string;
  grade?: string;
  studentNum?: string;
  birth?: string;
  bojId?: string;
  profileImage?: string;
  emailHide?: boolean;
}

interface UserInfoContentProps {
  loading: boolean;
}

/** 날짜 포맷팅 함수: 19990101 -> 1999.01.01 */
const formatDate = (dateStr?: string) => {
  if (!dateStr || dateStr.length !== 8) return dateStr || "-";
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${year}.${month}.${day}`;
};

const UserInfoContent: React.FC<UserInfoContentProps> = ({ loading: parentLoading }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [nicknameInput, setNicknameInput] = useState("");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const maxNicknameLength = 6;

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const res = await getMyPageInfo();
        if (res.success && res.data) {
          setUser(res.data);
          setNicknameInput(res.data.nickname || "");
        }
      } catch (error) {
        console.error("유저 정보 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  const handleToggleEmailHide = async () => {
    if (!user) return;
    try {
      const res = await toggleEmailHide();
      if (res.success) {
        setUser({ ...user, emailHide: res.emailHide });
      } else {
        alert(res.message || "이메일 설정 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("이메일 설정 변경 실패:", error);
      alert("이메일 설정 변경 중 오류가 발생했습니다.");
    }
  };

  if (loading || parentLoading) {
    return (
      <div className="py-20 text-center text-[#a3a3a3] font-medium">
        정보를 불러오는 중...
      </div>
    );
  }

  return (
    /* 💡 최상단을 Fragment(<>)로 감싸서 부모의 mt-6가 아래 테두리 박스에 직접 닿게 합니다. */
    <>
      <div
        className="border border-[#d4d4d4] rounded-[4px] overflow-hidden bg-white shadow-sm"
        style={{ padding: "31px 23px" }}
      >
        <div className="flex gap-6">
          {/* 왼쪽 컬럼 */}
          <div className="flex-1 flex flex-col gap-6">
            <InfoField label="이름" value={user?.name || "-"} />

            <InfoField
              label="생년월일"
              value={formatDate(user?.birth)}
              editable
              onEdit={() => console.log("생년월일 수정 클릭")}
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-medium text-[#0c0c0c]">
                  이메일
                </span>
                <button
                  onClick={handleToggleEmailHide}
                  className="flex items-center gap-1 text-[12px] font-semibold text-[#d97399] hover:underline"
                >
                  <img
                    src="/eye-on.svg"
                    alt="이메일 표시 설정"
                    className="w-[16px] h-[16px]"
                  />
                  {user?.emailHide ? "보이기" : "숨기기"}
                </button>
              </div>
              <span className="text-[16px] font-semibold text-[#525252]">
                {user?.emailHide ? "-" : (user?.email || "-")}
              </span>
            </div>
          </div>

          {/* 오른쪽 컬럼 */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[16px] font-medium text-[#0c0c0c]">
                닉네임
              </span>
              {isEditingNickname ? (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      autoFocus
                      value={nicknameInput}
                      onChange={(e) => {
                        if (e.target.value.length <= maxNicknameLength) {
                          setNicknameInput(e.target.value);
                        }
                      }}
                      className="w-full h-[32px] border-2 border-[#d97399] rounded-[4px] px-3 text-[14px] font-medium text-[#525252] outline-none"
                      maxLength={maxNicknameLength}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#d97399]">
                      {nicknameInput.length}/{maxNicknameLength}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (user) setUser({ ...user, nickname: nicknameInput });
                      setIsEditingNickname(false);
                    }}
                    className="text-green-500 text-lg font-bold"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setNicknameInput(user?.nickname || "");
                      setIsEditingNickname(false);
                    }}
                    className="text-gray-400 text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-semibold text-[#525252]">
                    {user?.nickname || "-"}
                  </span>
                  <button
                    onClick={() => setIsEditingNickname(true)}
                    className="text-[12px] font-semibold text-[#d97399] hover:underline"
                  >
                    수정
                  </button>
                </div>
              )}
            </div>

            <InfoField label="학과" value={user?.major || "-"} editable onEdit={() => {}} />
            <InfoField label="학번" value={user?.studentNum || "-"} editable onEdit={() => {}} />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-medium text-[#0c0c0c]">
                  백준 ID
                </span>
                <button className="text-[12px] font-semibold text-[#d97399] hover:underline">
                  수정
                </button>
              </div>
              <span className="text-[16px] font-semibold text-[#525252]">
                {user?.bojId || "백준 ID를 입력하면 내 프로필에 solved.ac 티어가 표시됩니다."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 안내 문구 (테두리 박스와의 간격 40px 유지) */}
      <p className="text-center text-[14px] font-medium mt-[40px] mb-[100px]">
        <span className="text-[#d97399]">특정 정보</span>
        <span className="text-[#8b8b8b]">는 관리자의 승인을 받아야 수정이 가능합니다.</span>
      </p>
    </>
  );
};

/* 개별 정보 필드 컴포넌트 */
interface InfoFieldProps {
  label: string;
  value: string;
  editable?: boolean;
  onEdit?: () => void;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, editable, onEdit }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-[16px] font-medium text-[#0c0c0c]">{label}</span>
      {editable && (
        <button onClick={onEdit} className="text-[12px] font-semibold text-[#d97399] hover:underline">
          수정
        </button>
      )}
    </div>
    <div 
      tabIndex={0}
      className="text-[16px] font-semibold text-[#525252] p-2 border-2 border-transparent rounded-[4px] transition-all focus:border-[#d97399] focus:outline-none"
    >
      {value}
    </div>
  </div>
);

export default UserInfoContent;