import "@/App.css";
import BlackButton from "@/components/Button/Black";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/Input";
import { registerAPI } from "@/api/auth";

function RegisterPage() {
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼의 기본 제출 동작 방지

    // FormData로 폼의 모든 input 값 수집
    const formData = new FormData(e.target as HTMLFormElement);
    const userId = formData.get("userid") as string;
    const name = formData.get("name") as string;
    const nickname = formData.get("nickname") as string;
    const password = formData.get("password") as string;
    const studentNum = formData.get("studentNum") as string;
    const email = formData.get("email") as string;
    const major = formData.get("major") as string;
    const universityName = formData.get("universityName") as string;
    const grade = formData.get("grade") as string;

    // 필수 필드 검증
    if (!userId || !name || !nickname || !password || !studentNum || !email || !major) {
      alert("아이디, 실명, 닉네임, 비밀번호, 학번, 이메일, 학과는 필수 입력 항목입니다.");
      return;
    }

    // 학번 9자리 검증
    if (studentNum.length !== 9) {
      alert("학번은 9자리여야 합니다.");
      return;
    }

    // 회원가입 API 호출
    const result = await registerAPI({
      userId,
      name,
      nickname,
      password,
      studentNum,
      email,
      major,
      universityName: universityName?.trim() || undefined,
      grade: grade?.trim() || undefined,
    });

    if (result.success) {
      alert("회원가입이 완료되었습니다!\n관리자 승인 대기 중입니다. 승인 후 로그인할 수 있습니다.");
      navigate("/login"); // 로그인 페이지로 이동
    } else {
      alert(result.message || "회원가입에 실패했습니다.");
    }
  };

  const goToLogIn = () => {
    navigate("/login");
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center pt-24">
        <h1 className="text-3xl font-bold mb-12">NIMDA CON</h1>
        <div className="text-xl font-bold mb-4">회원가입</div>
        <form onSubmit={handleRegister} className="flex flex-col gap-4 w-full max-w-md">
          <Input name="userid" placeholder="아이디 (로그인용)" required />
          <Input name="name" placeholder="실명" required />
          <Input name="nickname" placeholder="닉네임" required />
          <Input name="password" placeholder="비밀번호" type="password" required />
          <Input name="studentNum" placeholder="학번 (9자리)" maxLength={9} required />
          <Input name="email" placeholder="이메일" type="email" required />
          <Input name="major" placeholder="학과" required />
          <Input name="universityName" placeholder="대학교명 (선택)" />
          <Input name="grade" placeholder="학년 (선택)" />

          <BlackButton type="submit">회원가입</BlackButton>

          <BlackButton type="button" onClick={goToLogIn}>
            로그인
          </BlackButton>
        </form>
      </div>
    </Layout>
  );
}

export default RegisterPage;
