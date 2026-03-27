import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMyPageInfo,
  toggleEmailHide,
  updateProfileAPI,
  logoutAPI,
} from '@/api/auth';

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

type EditableField = 'nickname' | 'bojId' | 'birth' | 'major' | 'studentNum';

const getStringValue = (value: unknown): string =>
  typeof value === 'string' ? value : '';
const getBooleanValue = (value: unknown): boolean =>
  typeof value === 'boolean' ? value : false;

const splitBirthDate = (birth?: string) => ({
  year: birth && birth.length >= 4 ? birth.slice(0, 4) : '',
  month: birth && birth.length >= 6 ? birth.slice(4, 6) : '',
  day: birth && birth.length >= 8 ? birth.slice(6, 8) : '',
});

const isValidBirthDate = (dateStr: string): boolean => {
  if (!/^\d{8}$/.test(dateStr)) return false;

  const year = Number(dateStr.slice(0, 4));
  const month = Number(dateStr.slice(4, 6));
  const day = Number(dateStr.slice(6, 8));
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

/** 날짜 포맷팅 함수: 19990101 -> 1999.01.01 */
const formatDate = (dateStr?: string) => {
  if (!dateStr || dateStr.length !== 8) return dateStr || '-';
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${year}.${month}.${day}`;
};

const UserInfoContent: React.FC<UserInfoContentProps> = ({
  loading: parentLoading,
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<EditableField | null>(null);

  // 각 필드별 편집 상태
  const [nicknameInput, setNicknameInput] = useState('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const maxNicknameLength = 6;

  const [bojIdInput, setBojIdInput] = useState('');
  const [isEditingBojId, setIsEditingBojId] = useState(false);

  const [birthYearInput, setBirthYearInput] = useState('');
  const [birthMonthInput, setBirthMonthInput] = useState('');
  const [birthDayInput, setBirthDayInput] = useState('');
  const [isEditingBirth, setIsEditingBirth] = useState(false);

  const [majorInput, setMajorInput] = useState('');
  const [isEditingMajor, setIsEditingMajor] = useState(false);

  const [studentNumInput, setStudentNumInput] = useState('');
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
            nickname: getStringValue(raw.nickname),
            email: getStringValue(raw.email),
            major: getStringValue(raw.major),
            studentNum: getStringValue(raw.studentNum),
            birth: getStringValue(raw.birth),
            bojId: getStringValue(raw.bojId),
            emailHide: getBooleanValue(raw.emailHide ?? raw.email_hide),
          };
          setUser(normalized);
          setNicknameInput(normalized.nickname || '');
          setBojIdInput(normalized.bojId || '');
          const birthParts = splitBirthDate(normalized.birth);
          setBirthYearInput(birthParts.year);
          setBirthMonthInput(birthParts.month);
          setBirthDayInput(birthParts.day);
          setMajorInput(normalized.major || '');
          setStudentNumInput(normalized.studentNum || '');
        }
      } catch (error) {
        console.error('유저 정보 조회 실패:', error);
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
        const responseEmailHide = (res as { emailHide?: unknown }).emailHide;
        const nextEmailHide =
          typeof responseEmailHide === 'boolean'
            ? responseEmailHide
            : !getBooleanValue(user.emailHide);
        setUser((prev) =>
          prev ? { ...prev, emailHide: nextEmailHide } : prev
        );
      } else {
        alert(res.message || '이메일 설정 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('이메일 설정 변경 실패:', error);
      alert('이메일 설정 변경 중 오류가 발생했습니다.');
    }
  };

  /** 개별 필드를 API로 저장 */
  const handleSaveField = async (
    field: EditableField,
    value: string,
    setEditing: (v: boolean) => void
  ) => {
    if (!user) return;
    const trimmedValue = value.trim();

    if (field === 'nickname' && trimmedValue.length < 2) {
      alert('닉네임은 2자 이상이어야 합니다.');
      return;
    }

    if (field === 'birth' && trimmedValue && !isValidBirthDate(trimmedValue)) {
      alert('생년월일은 YYYYMMDD 형식의 올바른 날짜여야 합니다.');
      return;
    }

    setSavingField(field);
    try {
      const res = await updateProfileAPI({ [field]: trimmedValue });
      if (res.success) {
        if (field === 'nickname') {
          // 닉네임은 JWT 토큰에 포함되어 있어 변경 시 토큰이 유효하지 않음 → 재로그인 필요
          alert('닉네임이 변경되었습니다.\n보안을 위해 다시 로그인해 주세요.');
          logoutAPI();
          navigate('/login');
          return;
        }
        setUser((prev) => (prev ? { ...prev, [field]: trimmedValue } : prev));
        setEditing(false);
      } else {
        alert(res.message || '수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 수정 실패:', error);
      alert('서버 오류가 발생했습니다.');
    } finally {
      setSavingField(null);
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
        className="border border-[#d4d4d4] rounded-[4px] overflow-hidden bg-white"
        style={{ padding: '31px 23px' }}
      >
        <div className="flex gap-6">
          {/* 왼쪽 컬럼 */}
          <div className="flex-1 flex flex-col gap-6">
            <InfoField label="이름" value={user?.name || '-'} />

            {/* 생년월일 - 인라인 편집 */}
            {isEditingBirth ? (
              <div className="flex flex-col gap-2">
                <span className="text-[16px] font-medium text-[#0c0c0c]">
                  생년월일
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={birthYearInput}
                      onChange={(e) =>
                        setBirthYearInput(
                          e.target.value.replace(/[^0-9]/g, '').slice(0, 4)
                        )
                      }
                      placeholder="년(4자)"
                      className="w-full h-[32px] border-2 border-[#d97399] rounded-[4px] pl-5 pr-3 text-[14px] font-medium text-[#525252] outline-none"
                      style={{ paddingLeft: '16px' }}
                      maxLength={4}
                    />
                    <input
                      type="text"
                      value={birthMonthInput}
                      onChange={(e) =>
                        setBirthMonthInput(
                          e.target.value.replace(/[^0-9]/g, '').slice(0, 2)
                        )
                      }
                      placeholder="월"
                      className="w-full h-[32px] border-2 border-[#d97399] rounded-[4px] pl-5 pr-3 text-[14px] font-medium text-[#525252] outline-none"
                      style={{ paddingLeft: '16px' }}
                      maxLength={2}
                    />
                    <input
                      type="text"
                      value={birthDayInput}
                      onChange={(e) =>
                        setBirthDayInput(
                          e.target.value.replace(/[^0-9]/g, '').slice(0, 2)
                        )
                      }
                      placeholder="일"
                      className="w-full h-[32px] border-2 border-[#d97399] rounded-[4px] pl-5 pr-3 text-[14px] font-medium text-[#525252] outline-none"
                      style={{ paddingLeft: '16px' }}
                      maxLength={2}
                    />
                  </div>
                  <button
                    onClick={() =>
                      handleSaveField(
                        'birth',
                        `${birthYearInput}${birthMonthInput}${birthDayInput}`,
                        setIsEditingBirth
                      )
                    }
                    disabled={savingField === 'birth'}
                    className="shrink-0"
                  >
                    <img src="/check 1.svg" alt="저장" className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const birthParts = splitBirthDate(user?.birth);
                      setBirthYearInput(birthParts.year);
                      setBirthMonthInput(birthParts.month);
                      setBirthDayInput(birthParts.day);
                      setIsEditingBirth(false);
                    }}
                    className="shrink-0"
                  >
                    <img src="/no 1.svg" alt="취소" className="w-5 h-5" />
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
                    className={`w-[16px] h-[16px] ${
                      user?.emailHide ? 'opacity-40' : 'opacity-100'
                    }`}
                  />
                  {user?.emailHide ? '보이기' : '숨기기'}
                </button>
              </div>
              <span
                className={
                  user?.emailHide
                    ? 'text-[13px] font-medium text-[#a3a3a3]'
                    : 'text-[16px] font-semibold text-[#525252]'
                }
              >
                {user?.emailHide ? '숨김 상태입니다.' : user?.email || '-'}
              </span>
            </div>
          </div>

          {/* 오른쪽 컬럼 */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-medium text-[#0c0c0c]">
                  닉네임
                </span>
                {!isEditingNickname && (
                  <button
                    onClick={() => setIsEditingNickname(true)}
                    className="text-[12px] font-semibold text-[#d97399] hover:underline"
                  >
                    수정
                  </button>
                )}
              </div>
              {isEditingNickname ? (
                <div className="flex items-center gap-3">
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
                      className="w-full h-[32px] border-2 border-[#d97399] rounded-[4px] pl-5 pr-12 text-[14px] font-medium text-[#525252] outline-none"
                      style={{ paddingLeft: '16px' }}
                      maxLength={maxNicknameLength}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#d97399]">
                      {nicknameInput.length}/{maxNicknameLength}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleSaveField(
                        'nickname',
                        nicknameInput,
                        setIsEditingNickname
                      )
                    }
                    disabled={savingField === 'nickname'}
                    className="shrink-0"
                  >
                    <img src="/check 1.svg" alt="저장" className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setNicknameInput(user?.nickname || '');
                      setIsEditingNickname(false);
                    }}
                    className="shrink-0"
                  >
                    <img src="/no 1.svg" alt="취소" className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <span className="text-[16px] font-semibold text-[#525252]">
                  {user?.nickname || '-'}
                </span>
              )}
            </div>

            {/* 학과 - 인라인 편집 */}
            {isEditingMajor ? (
              <div className="flex flex-col gap-2">
                <span className="text-[16px] font-medium text-[#0c0c0c]">
                  학과
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    autoFocus
                    value={majorInput}
                    onChange={(e) => setMajorInput(e.target.value)}
                    className="flex-1 h-[32px] border-2 border-[#d97399] rounded-[4px] pl-5 pr-3 text-[14px] font-medium text-[#525252] outline-none"
                    style={{ paddingLeft: '16px' }}
                    maxLength={20}
                  />
                  <button
                    onClick={() =>
                      handleSaveField('major', majorInput, setIsEditingMajor)
                    }
                    disabled={savingField === 'major'}
                    className="shrink-0"
                  >
                    <img src="/check 1.svg" alt="저장" className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setMajorInput(user?.major || '');
                      setIsEditingMajor(false);
                    }}
                    className="shrink-0"
                  >
                    <img src="/no 1.svg" alt="취소" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <InfoField
                label="학과"
                value={user?.major || '-'}
                editable
                onEdit={() => setIsEditingMajor(true)}
              />
            )}

            {/* 학번 - 인라인 편집 */}
            {isEditingStudentNum ? (
              <div className="flex flex-col gap-2">
                <span className="text-[16px] font-medium text-[#0c0c0c]">
                  학번
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    autoFocus
                    value={studentNumInput}
                    onChange={(e) => setStudentNumInput(e.target.value)}
                    className="flex-1 h-[32px] border-2 border-[#d97399] rounded-[4px] pl-5 pr-3 text-[14px] font-medium text-[#525252] outline-none"
                    style={{ paddingLeft: '16px' }}
                    maxLength={9}
                  />
                  <button
                    onClick={() =>
                      handleSaveField(
                        'studentNum',
                        studentNumInput,
                        setIsEditingStudentNum
                      )
                    }
                    disabled={savingField === 'studentNum'}
                    className="shrink-0"
                  >
                    <img src="/check 1.svg" alt="저장" className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setStudentNumInput(user?.studentNum || '');
                      setIsEditingStudentNum(false);
                    }}
                    className="shrink-0"
                  >
                    <img src="/no 1.svg" alt="취소" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <InfoField
                label="학번"
                value={user?.studentNum || '-'}
                editable
                onEdit={() => setIsEditingStudentNum(true)}
              />
            )}

            {/* 백준 ID - 인라인 편집 */}
            {isEditingBojId ? (
              <div className="flex flex-col gap-2">
                <span className="text-[16px] font-medium text-[#0c0c0c]">
                  백준 ID
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    autoFocus
                    value={bojIdInput}
                    onChange={(e) => setBojIdInput(e.target.value)}
                    className="flex-1 h-[32px] border-2 border-[#d97399] rounded-[4px] pl-5 pr-3 text-[14px] font-medium text-[#525252] outline-none"
                    style={{ paddingLeft: '16px' }}
                    maxLength={50}
                  />
                  <button
                    onClick={() =>
                      handleSaveField('bojId', bojIdInput, setIsEditingBojId)
                    }
                    disabled={savingField === 'bojId'}
                    className="shrink-0"
                  >
                    <img src="/check 1.svg" alt="저장" className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setBojIdInput(user?.bojId || '');
                      setIsEditingBojId(false);
                    }}
                    className="shrink-0"
                  >
                    <img src="/no 1.svg" alt="취소" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-medium text-[#0c0c0c]">
                    백준 ID
                  </span>
                  <button
                    onClick={() => setIsEditingBojId(true)}
                    className="text-[12px] font-semibold text-[#d97399] hover:underline"
                  >
                    수정
                  </button>
                </div>
                <span
                  className={
                    user?.bojId
                      ? 'text-[16px] font-semibold text-[#525252]'
                      : 'text-[13px] font-medium text-[#a3a3a3]'
                  }
                >
                  {user?.bojId ||
                    '백준 ID를 입력하면 내 프로필에 solved.ac 티어가 표시됩니다.'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <p
        className="text-center text-[14px] font-medium"
        style={{ marginTop: '48px', marginBottom: '80px' }}
      >
        <span className="text-[#d97399]">특정 정보</span>
        <span className="text-[#8b8b8b]">
          는 관리자의 승인을 받아야 수정이 가능합니다.
        </span>
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

const InfoField: React.FC<InfoFieldProps> = ({
  label,
  value,
  editable,
  onEdit,
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-[16px] font-medium text-[#0c0c0c]">{label}</span>
      {editable && (
        <button
          onClick={onEdit}
          className="text-[12px] font-semibold text-[#d97399] hover:underline"
        >
          수정
        </button>
      )}
    </div>
    <div className="text-[16px] font-semibold text-[#525252] p-2 border-2 border-transparent rounded-[4px]">
      {value}
    </div>
  </div>
);

export default UserInfoContent;
