import "@/App.css";
import "./Register.css";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerAPI } from "@/api/auth";

const STEPS = ["기본 정보", "활동 정보", "가입 완료"] as const;

interface FormData {
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  email: string;
  major: string;
  studentNum: string;
  userId: string;
  password: string;
  nickname: string;
  bojId: string;
}

const INITIAL: FormData = {
  name: "",
  birthYear: "",
  birthMonth: "",
  birthDay: "",
  email: "",
  major: "",
  studentNum: "",
  userId: "",
  password: "",
  nickname: "",
  bojId: "",
};

function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showPw, setShowPw] = useState(false);

  const set = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateStep1 = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "이름을 입력해 주세요.";
    const y = parseInt(form.birthYear), m = parseInt(form.birthMonth), d = parseInt(form.birthDay);
    if (!form.birthYear || !form.birthMonth || !form.birthDay || isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31)
      e.birthYear = "유효한 생년월일을 입력해 주세요.";
    if (!form.email.trim()) e.email = "이메일을 입력해 주세요.";
    if (!form.major.trim()) e.major = "학과를 입력해 주세요.";
    if (!form.studentNum.trim()) e.studentNum = "학번을 입력해 주세요.";
    else if (form.studentNum.trim().length !== 9) e.studentNum = "학번은 9자리여야 합니다.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: typeof errors = {};
    if (!form.userId.trim()) e.userId = "아이디를 입력해 주세요.";
    if (!form.password || form.password.length < 4 || form.password.length > 19)
      e.password = "4-19자 사이로 입력해 주세요.";
    if (!form.nickname.trim()) e.nickname = "닉네임을 입력해 주세요.";
    else if (form.nickname.trim().length > 6) e.nickname = "1-6자 사이로 입력해 주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (step === 0 && validateStep1()) setStep(1);
  };

  const goPrev = () => {
    if (step === 1) { setErrors({}); setStep(0); }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    const birth = `${form.birthYear}-${form.birthMonth.padStart(2, "0")}-${form.birthDay.padStart(2, "0")}`;

    const result = await registerAPI({
      userId: form.userId.trim(),
      name: form.name.trim(),
      nickname: form.nickname.trim(),
      password: form.password,
      studentNum: form.studentNum.trim(),
      email: form.email.trim(),
      major: form.major.trim(),
      bojId: form.bojId.trim() || undefined,
      birth,
    });

    if (result.success) {
      setStep(2);
    } else {
      if (result.message?.includes("User ID")) {
        setErrors({ userId: "이미 사용 중인 아이디입니다." });
      } else if (result.message?.includes("Nickname")) {
        setErrors({ nickname: "이미 사용 중인 닉네임입니다." });
      } else if (result.message?.includes("Email")) {
        setErrors({ email: "이미 사용 중인 이메일입니다." });
        setStep(0);
      } else {
        alert(result.message || "회원가입에 실패했습니다.");
      }
    }
  };

  return (
    <Layout hideSidebar>
      <div className="reg">
        <h1 className="reg__title">회원가입</h1>

        <div className="reg__steps">
          {STEPS.map((label, i) => (
            <span key={label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {i > 0 && <span className="reg__step-dot" />}
              <span className={`reg__step ${step === i ? "reg__step--active" : ""}`}>{label}</span>
            </span>
          ))}
        </div>

        <div className="reg__card">
          {step === 0 && (
            <>
              <div className="reg__columns">
                <div className="reg__col">
                  {/* 이름 */}
                  <div className="reg__field">
                    <div className="reg__label">이름<span className="reg__required">*</span></div>
                    <input
                      className={`reg__input ${errors.name ? "reg__input--error" : ""}`}
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="이름"
                    />
                    {errors.name && <div className="reg__error">{errors.name}</div>}
                  </div>

                  {/* 생년월일 */}
                  <div className="reg__field">
                    <div className="reg__label">생년월일<span className="reg__required">*</span></div>
                    <div className="reg__birth-row">
                      <input
                        className="reg__birth-input reg__birth-input--year"
                        value={form.birthYear}
                        onChange={(e) => set("birthYear", e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="년(4자)"
                        maxLength={4}
                      />
                      <input
                        className="reg__birth-input reg__birth-input--month"
                        value={form.birthMonth}
                        onChange={(e) => set("birthMonth", e.target.value.replace(/\D/g, "").slice(0, 2))}
                        placeholder="월"
                        maxLength={2}
                      />
                      <input
                        className="reg__birth-input reg__birth-input--day"
                        value={form.birthDay}
                        onChange={(e) => set("birthDay", e.target.value.replace(/\D/g, "").slice(0, 2))}
                        placeholder="일"
                        maxLength={2}
                      />
                    </div>
                    {errors.birthYear && <div className="reg__error">{errors.birthYear}</div>}
                  </div>

                  {/* 이메일 */}
                  <div className="reg__field">
                    <div className="reg__label">이메일<span className="reg__required">*</span></div>
                    <input
                      className={`reg__input ${errors.email ? "reg__input--error" : ""}`}
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="이메일"
                    />
                    {errors.email && <div className="reg__error">{errors.email}</div>}
                  </div>
                </div>

                <div className="reg__col">
                  {/* 학과 */}
                  <div className="reg__field">
                    <div className="reg__label">학과<span className="reg__required">*</span></div>
                    <input
                      className={`reg__input-box ${errors.major ? "reg__input-box--error" : ""}`}
                      value={form.major}
                      onChange={(e) => set("major", e.target.value)}
                      placeholder="학과를 입력하세요"
                    />
                    {errors.major && <div className="reg__error">{errors.major}</div>}
                  </div>

                  {/* 학번 */}
                  <div className="reg__field">
                    <div className="reg__label">학번<span className="reg__required">*</span></div>
                    <input
                      className={`reg__input ${errors.studentNum ? "reg__input--error" : ""}`}
                      value={form.studentNum}
                      onChange={(e) => set("studentNum", e.target.value.replace(/\D/g, "").slice(0, 9))}
                      placeholder="9자리 학번"
                      maxLength={9}
                    />
                    {errors.studentNum && <div className="reg__error">{errors.studentNum}</div>}
                  </div>
                </div>
              </div>

              <div className="reg__actions">
                <button type="button" className="reg__btn reg__btn--primary" onClick={goNext}>다음</button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="reg__columns">
                <div className="reg__col">
                  {/* ID */}
                  <div className="reg__field">
                    <div className="reg__label">ID<span className="reg__required">*</span></div>
                    <input
                      className={`reg__input ${errors.userId ? "reg__input--error" : ""}`}
                      value={form.userId}
                      onChange={(e) => set("userId", e.target.value)}
                      placeholder="아이디"
                    />
                    {errors.userId && <div className="reg__error">{errors.userId}</div>}
                  </div>

                  {/* 비밀번호 */}
                  <div className="reg__field">
                    <div className="reg__label">비밀번호<span className="reg__required">*</span></div>
                    <div className="reg__pw-wrap">
                      <input
                        className={`reg__input-box ${errors.password ? "reg__input-box--error" : ""}`}
                        type={showPw ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        placeholder="비밀번호"
                      />
                      <button
                        type="button"
                        className="reg__pw-toggle"
                        onClick={() => setShowPw((v) => !v)}
                        tabIndex={-1}
                        aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
                      >
                        {showPw ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && <div className="reg__error">{errors.password}</div>}
                  </div>
                </div>

                <div className="reg__col">
                  {/* 닉네임 */}
                  <div className="reg__field">
                    <div className="reg__label">닉네임<span className="reg__required">*</span></div>
                    <input
                      className={`reg__input ${errors.nickname ? "reg__input--error" : ""}`}
                      value={form.nickname}
                      onChange={(e) => set("nickname", e.target.value)}
                      placeholder="닉네임"
                    />
                    {errors.nickname && <div className="reg__error">{errors.nickname}</div>}
                  </div>

                  {/* 백준 ID */}
                  <div className="reg__field">
                    <div className="reg__label">백준 ID</div>
                    <input
                      className="reg__input"
                      value={form.bojId}
                      onChange={(e) => set("bojId", e.target.value)}
                      placeholder="백준 ID (선택)"
                    />
                  </div>
                </div>
              </div>

              <div className="reg__actions">
                <button type="button" className="reg__btn reg__btn--secondary" onClick={goPrev}>이전</button>
                <button type="button" className="reg__btn reg__btn--primary" onClick={handleSubmit}>완료</button>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="reg__complete">
              <div className="reg__complete-msg">
                회원가입이 정상적으로 완료되었습니다.<br />
                관리자 승인 후 로그인할 수 있습니다.
              </div>
              <button
                type="button"
                className="reg__btn reg__btn--primary reg__btn--confirm"
                onClick={() => navigate("/login")}
              >
                확인
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default RegisterPage;
