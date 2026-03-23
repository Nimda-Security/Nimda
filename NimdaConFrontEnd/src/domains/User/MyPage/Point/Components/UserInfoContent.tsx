import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyPageInfo, toggleEmailHide, updateProfileAPI, logoutAPI } from "@/api/auth";

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
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 각 필드별 편집 상태
  const [nicknameInput, setNicknameInput] = useState("");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const maxNicknameLength = 6;

  const [bojIdInput, setBojIdInput] = useState("");
  const [isEditingBojId, setIsEditingBojId] = useState(false);

  const [birthInput, setBirthInput] = useState("");
  const [isEditingBirth, setIsEditingBirth] = useState(false);

  const [majorInput, setMajorInput] = useState("");
  const [isEditingMajor, setIsEditingMajor] = useState(false);

  const [studentNumInput, setStudentNumInput] = useState("");
  const [isEditingStudentNum, setIsEditingStudentNum] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const res = await getMyPageInfo();
        if (res.success && res.data) {
          const raw = res.data as Record<string, unknown>;
          const normalized: UserData = {
            ...raw,
            emailHide: (raw.emailHide ?? raw.email_hide ?? false) as boolean,
          };
          setUser(normalized);
          setNicknameInput((raw.nickname as string) || "");
          setBojIdInput((raw.bojId as string) || "");
          setBirthInput((raw.birth as string) || "");
          setMajorInput((raw.major as string) || "");
          setStudentNumInput((raw.studentNum as string) || "");
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

  /** 개별 필드를 API로 저장 */
  const handleSaveField = async (
    field: "nickname" | "bojId" | "birth" | "major" | "studentNum",
    value: string,
    setEditing: (v: boolean) => void
  ) => {
    if (!user) return;
    if (field === "nickname" && value.trim().length < 2) {
      alert("닉네임은 2자 이상이어야 합니다.");
      return;
    }
    setSaving(true);
    try {
      const res = await updateProfileAPI({ [field]: value.trim() });
      if (res.success) {
        if (field === "nickname") {
          // 닉네임은 JWT 토큰에 포함되어 있어 변경 시 토큰이 유효하지 않음 → 재로그인 필요
          alert("닉네임이 변경되었습니다.\n보안을 위해 다시 로그인해 주세요.");
          logoutAPI();
          navigate("/login");
          return;
        }
        setUser({ ...user, [field]: value.trim() });
        setEditing(false);
      } else {
        alert(res.message || "수정에 실패했습니다.");
      }
    } catch {
      alert("서버 오류가 발생했습니다.");
    } finally {
      setSaving(false);
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

            {/* 생년월일 - 인라인 편집 */}
            {isEditingBirth ? (
              <div className="flex flex-col gap-2">
                <span className="text-[16px] font-medium text-[#0c0c0c]">생년월일</span>
                <div className="flex items-center">
                  <input
                    type="text"
                    autoFocus
                    value={birthInput}
                    onChange={(e) => setBirthInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
                    placeholder="YYYYMMDD"
                    className="flex-1 h-[32px] border-2 border-[#d97399] rounded-[4px] px-3 text-[14px] font-medium text-[#525252] outline-none"
                    maxLength={8}
                  />
                  <button onClick={() => handleSaveField("birth", birthInput, setIsEditingBirth)} disabled={saving} style={{ marginLeft: '15px' }}>
                    <img src="/check 1.svg" alt="저장" style={{ width: '20px', height: '20px' }} />
                  </button>
                  <button onClick={() => { setBirthInput(user?.birth || ""); setIsEditingBirth(false); }} style={{ marginLeft: '20px' }}>
                    <img src="/no 1.svg" alt="취소" style={{ width: '20px', height: '20px' }} />
                  </button>
                </div>
              </div>
            ) : (
              <InfoField
                label="생년월일"
                value={formatDate(user?.birth)}
                editable
                onEdit={() => setIsEditingBirth(true)}
              />
            )}

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
                <div className="flex items-center">
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
                    onClick={() => handleSaveField("nickname", nicknameInput, setIsEditingNickname)}
                    disabled={saving}
                    style={{ marginLeft: '15px' }}
                  >
                    <img src="/check 1.svg" alt="저장" style={{ width: '20px', height: '20px' }} />
                  </button>
                  <button
                    onClick={() => {
                      setNicknameInput(user?.nickname || "");
                      setIsEditingNickname(false);
                    }}
                    style={{ marginLeft: '20px' }}
                  >
                    <img src="/no 1.svg" alt="취소" style={{ width: '20px', height: '20px' }} />
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

            {/* 학과 - 인라인 편집 */}
            {isEditingMajor ? (
              <div className="flex flex-col gap-2">
                <span className="text-[16px] font-medium text-[#0c0c0c]">학과</span>
                <div className="flex items-center">
                  <input
                    type="text"
                    autoFocus
                    value={majorInput}
                    onChange={(e) => setMajorInput(e.target.value)}
                    className="flex-1 h-[32px] border-2 border-[#d97399] rounded-[4px] px-3 text-[14px] font-medium text-[#525252] outline-none"
                    maxLength={20}
                  />
                  <button onClick={() => handleSaveField("major", majorInput, setIsEditingMajor)} disabled={saving} style={{ marginLeft: '15px' }}>
                    <img src="/check 1.svg" alt="저장" style={{ width: '20px', height: '20px' }} />
                  </button>
                  <button onClick={() => { setMajorInput(user?.major || ""); setIsEditingMajor(false); }} style={{ marginLeft: '20px' }}>
                    <img src="/no 1.svg" alt="취소" style={{ width: '20px', height: '20px' }} />
                  </button>
                </div>
              </div>
            ) : (
              <InfoField label="학과" value={user?.major || "-"} editable onEdit={() => setIsEditingMajor(true)} />
            )}

            {/* 학번 - 인라인 편집 */}
            {isEditingStudentNum ? (
              <div className="flex flex-col gap-2">
                <span className="text-[16px] font-medium text-[#0c0c0c]">학번</span>
                <div className="flex items-center">
                  <input
                    type="text"
                    autoFocus
                    value={studentNumInput}
                    onChange={(e) => setStudentNumInput(e.target.value)}
                    className="flex-1 h-[32px] border-2 border-[#d97399] rounded-[4px] px-3 text-[14px] font-medium text-[#525252] outline-none"
                    maxLength={9}
                  />
                  <button onClick={() => handleSaveField("studentNum", studentNumInput, setIsEditingStudentNum)} disabled={saving} style={{ marginLeft: '15px' }}>
                    <img src="/check 1.svg" alt="저장" style={{ width: '20px', height: '20px' }} />
                  </button>
                  <button onClick={() => { setStudentNumInput(user?.studentNum || ""); setIsEditingStudentNum(false); }} style={{ marginLeft: '20px' }}>
                    <img src="/no 1.svg" alt="취소" style={{ width: '20px', height: '20px' }} />
                  </button>
                </div>
              </div>
            ) : (
              <InfoField label="학번" value={user?.studentNum || "-"} editable onEdit={() => setIsEditingStudentNum(true)} />
            )}

            {/* 백준 ID - 인라인 편집 */}
            {isEditingBojId ? (
              <div className="flex flex-col gap-2">
                <span className="text-[16px] font-medium text-[#0c0c0c]">백준 ID</span>
                <div className="flex items-center">
                  <input
                    type="text"
                    autoFocus
                    value={bojIdInput}
                    onChange={(e) => setBojIdInput(e.target.value)}
                    className="flex-1 h-[32px] border-2 border-[#d97399] rounded-[4px] px-3 text-[14px] font-medium text-[#525252] outline-none"
                    maxLength={50}
                  />
                  <button onClick={() => handleSaveField("bojId", bojIdInput, setIsEditingBojId)} disabled={saving} style={{ marginLeft: '15px' }}>
                    <img src="/check 1.svg" alt="저장" style={{ width: '20px', height: '20px' }} />
                  </button>
                  <button onClick={() => { setBojIdInput(user?.bojId || ""); setIsEditingBojId(false); }} style={{ marginLeft: '20px' }}>
                    <img src="/no 1.svg" alt="취소" style={{ width: '20px', height: '20px' }} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-medium text-[#0c0c0c]">백준 ID</span>
                  <button onClick={() => setIsEditingBojId(true)} className="text-[12px] font-semibold text-[#d97399] hover:underline">수정</button>
                </div>
                <span className="text-[16px] font-semibold text-[#525252]">
                  {user?.bojId || "백준 ID를 입력하면 내 프로필에 solved.ac 티어가 표시됩니다."}
                </span>
              </div>
            )}
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