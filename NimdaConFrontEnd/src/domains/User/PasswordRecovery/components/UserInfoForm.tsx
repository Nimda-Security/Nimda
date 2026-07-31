import { useState } from "react";
import UnderlineField from "./UnderlineField";
import { checkUserInfoAPI, sendAuthMailAPI, type CheckUserValidateRequest } from "@/api/userRecovery";

interface FieldErrors {
  userId?: string;
  studentNum?: string;
  email?: string;
}

function UserInfoForm({ onSent }: { onSent: () => void }) {
  const [form, setForm] = useState<CheckUserValidateRequest>({ userId: "", studentNum: "", email: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (key: keyof CheckUserValidateRequest, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrors({});

    const req: CheckUserValidateRequest = {
      userId: form.userId.trim(),
      studentNum: form.studentNum.trim(),
      email: form.email.trim(),
    };

    if (!req.userId || !req.studentNum || !req.email) {
      setErrors({
        userId: !req.userId ? "아이디를 입력해 주세요." : undefined,
        studentNum: !req.studentNum ? "학번을 입력해 주세요." : undefined,
        email: !req.email ? "이메일을 입력해 주세요." : undefined,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const checkResult = await checkUserInfoAPI(req);

      if (!checkResult.success || !checkResult.data) {
        setErrors({ userId: checkResult.message });
        return;
      }

      const { validateUserId, validateStudentNum, validateEmail } = checkResult.data;
      if (!validateUserId || !validateStudentNum || !validateEmail) {
        setErrors({
          userId: !validateUserId ? "존재하지 않는 ID 입니다." : undefined,
          studentNum: !validateStudentNum ? "계정 정보와 불일치합니다." : undefined,
          email: !validateEmail ? "사용자의 메일과 일치하지 않습니다." : undefined,
        });
        return;
      }

      const sendResult = await sendAuthMailAPI(req);
      if (sendResult.success) {
        onSent();
      } else {
        setErrors({ email: sendResult.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pr__form">
      <UnderlineField
        label="ID"
        value={form.userId}
        onChange={(e) => set("userId", e.target.value)}
        error={errors.userId}
        placeholder="아이디"
        autoComplete="username"
      />
      <UnderlineField
        label="학번"
        value={form.studentNum}
        onChange={(e) => set("studentNum", e.target.value.replace(/\D/g, "").slice(0, 9))}
        error={errors.studentNum}
        placeholder="9자리 학번"
        maxLength={9}
      />
      <UnderlineField
        label="메일 주소"
        type="email"
        value={form.email}
        onChange={(e) => set("email", e.target.value)}
        error={errors.email}
        placeholder="이메일"
      />

      <div className="pr__actions">
        <button type="submit" className="pr__btn pr__btn--primary" disabled={isSubmitting}>
          {isSubmitting ? "전송 중..." : "전송"}
        </button>
      </div>
    </form>
  );
}

export default UserInfoForm;
