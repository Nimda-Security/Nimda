import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePasswordAPI } from "@/api/userRecovery";

function NewPasswordForm() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (password.length < 4 || password.length > 19) {
      setError("4-19자 사이로 입력해 주세요.");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const result = await changePasswordAPI(password);
      if (result.success) {
        setShowToast(true);
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pr__form pr__form--center">
      <p className="pr__subtitle">새로운 비밀번호를 설정해주세요</p>

      <input
        type="password"
        className="pr__box-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="새 비밀번호 입력"
        autoComplete="new-password"
      />
      <input
        type="password"
        className="pr__box-input"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="비밀번호 확인"
        autoComplete="new-password"
      />
      {error && <p className="pr__pw-error">{error}</p>}

      <div className="pr__actions pr__actions--center">
        <button type="submit" className="pr__btn pr__btn--dark pr__btn--complete" disabled={isSubmitting}>
          {isSubmitting ? "변경 중..." : "비밀번호 변경 완료"}
        </button>
      </div>

      {showToast && <div className="copy-toast">비밀번호가 변경되었습니다.</div>}
    </form>
  );
}

export default NewPasswordForm;
