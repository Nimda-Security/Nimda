import { useState } from "react";
import { checkAuthCodeAPI } from "@/api/userRecovery";
import { useCountdown } from "../hooks/useCountdown";

const AUTH_CODE_SECONDS = 5 * 60;

function AuthCodeForm({ onSuccess, onFail }: { onSuccess: () => void; onFail: (message?: string) => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { label, isExpired } = useCountdown(AUTH_CODE_SECONDS, () => onFail("인증 시간이 초과되었습니다."));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || isExpired) return;
    if (!code.trim()) {
      setError("인증번호를 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await checkAuthCodeAPI(code.trim());
      if (result.success) {
        onSuccess();
      } else {
        onFail(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pr__form pr__form--center">
      <img src="/mail-unverified.png" alt="" className="pr__mail-icon" />
      <p className="pr__msg">인증 메일이 발송되었습니다.</p>
      <p className="pr__msg pr__msg--sub">5분 내에 번호를 입력해 주세요.</p>

      <div className="pr__code-wrap">
        <input
          className="pr__code-input"
          value={code}
          onChange={(e) => setCode(e.target.value.slice(0, 10))}
          placeholder="인증번호 10자리 입력"
          maxLength={10}
        />
        <span className="pr__code-timer">{label}</span>
      </div>
      {error && <p className="pr__field-error pr__field-error--center">{error}</p>}

      <div className="pr__actions pr__actions--center">
        <button type="submit" className="pr__btn pr__btn--primary" disabled={isSubmitting || isExpired}>
          {isSubmitting ? "확인 중..." : "인증"}
        </button>
      </div>
    </form>
  );
}

export default AuthCodeForm;
