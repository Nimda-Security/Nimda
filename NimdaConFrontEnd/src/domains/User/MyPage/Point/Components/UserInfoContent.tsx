import React, { useState, useEffect } from "react";
import { getMyPageInfo } from "@/api/auth";

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
}

interface UserInfoContentProps {
  loading: boolean;
}

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
        // res.data가 백엔드에서 넘겨주는 MyPageResponseDTO 데이터임
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

  if (loading || parentLoading) {
    return (
      <div className="py-12 text-center text-[#a3a3a3]">
        정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div>
      {/* 세부정보 영역 */}
      <div
        className="border border-[#d4d4d4] rounded-[4px] overflow-hidden"
        style={{ padding: "31px 23px" }}
      >
        <div className="flex gap-8">
          {/* 왼쪽 컬럼 */}
          <div className="flex-1 flex flex-col" style={{ gap: "24px" }}>
            {/* 이름 */}
            <InfoField label="이름" value={user?.name || "-"} />

            {/* 생년월일 (user.birth 바인딩) */}
            <InfoField
              label="생년월일"
              value={formatDate(user?.birth)}
              editable
              onEdit={() => {
                /* TODO: 캘린더 모달 또는 입력 폼 띄우기 */
                console.log("생년월일 수정 클릭");
              }}
            />

            {/* 이메일 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-medium text-[#0c0c0c]">
                  이메일
                </span>
                <button className="flex items-center gap-1 text-[12px] font-semibold text-[#d97399]">
                  <img
                      src="/eye-on.svg"  // 파일명을 변경했을 경우
                      alt="보이기"
                      className="w-[16px] h-[16px]"
                    /> 숨기기
                </button>
              </div>
              <span className="text-[16px] font-semibold text-[#525252]">
                {user?.email || "-"}
              </span>
            </div>
          </div>

          {/* 오른쪽 컬럼 */}
          <div className="flex-1 flex flex-col" style={{ gap: "24px" }}>
            {/* 닉네임 수정 로직 */}
            <div className="flex flex-col gap-2">
              <span className="text-[16px] font-medium text-[#0c0c0c]">
                닉네임
              </span>
              {isEditingNickname ? (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
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
                      /* TODO: 닉네임 변경 API 호출 (updateNicknameAPI 등) */
                      // 성공 시 로컬 상태 반영
                      if (user) setUser({ ...user, nickname: nicknameInput });
                      setIsEditingNickname(false);
                    }}
                    className="text-green-500 text-lg"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setNicknameInput(user?.nickname || "");
                      setIsEditingNickname(false);
                    }}
                    className="text-gray-400 text-lg"
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
                    className="text-[12px] font-semibold text-[#d97399]"
                  >
                    수정
                  </button>
                </div>
              )}
            </div>

            {/* 학과 (user.major 바인딩) */}
            <InfoField
              label="학과"
              value={user?.major || "-"}
              editable
              onEdit={() => {
                /* TODO: 학과 선택 드롭다운 띄우기 */
                console.log("학과 수정 클릭");
              }}
            />

            {/* 학번 (user.studentNum 바인딩) */}
            <InfoField
              label="학번"
              value={user?.studentNum || "-"}
              editable
              onEdit={() => {
                /* TODO: 학번 수정 입력창 띄우기 */
                console.log("학번 수정 클릭");
              }}
            />

            {/* 백준 ID */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-medium text-[#0c0c0c]">
                  백준 ID
                </span>
                <button className="text-[12px] font-semibold text-[#d97399]">
                  수정
                </button>
              </div>
              {user?.bojId ? (
                <span className="text-[16px] font-semibold text-[#525252]">
                  {user.bojId}
                </span>
              ) : (
                <span className="text-[14px] font-medium text-[#a3a3a3]">
                  백준 ID를 입력하면 내 프로필에 solved.ac 티어가 표시됩니다.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 안내 문구 */}
      <p
        className="text-center text-[14px] font-medium"
        style={{ marginTop: '40px', marginBottom: '100px' }} // px 단위로 강제 주입
      >
        <span className="text-[#d97399]">특정 정보</span>
        <span className="text-[#8b8b8b]">는 관리자의 승인을 받아야 수정이 가능합니다.</span>
      </p>
    </div>
  );
};

/* 공통 정보 필드 컴포넌트 */
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
        <button
          onClick={onEdit}
          className="text-[12px] font-semibold text-[#d97399]"
        >
          수정
        </button>
      )}
    </div>
    <span className="text-[16px] font-semibold text-[#525252]">{value}</span>
  </div>
);

export default UserInfoContent;