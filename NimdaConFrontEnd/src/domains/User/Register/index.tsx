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
    const nickname = formData.get("nickname") as string;
    const password = formData.get("password") as string;
    const email = formData.get("email") as string;
    const universityName = formData.get("universityName") as string;
    const department = formData.get("department") as string;
    const grade = formData.get("grade") as string;

    // 필수 필드 검증
    if (!userId || !nickname || !password || !email) {
      alert("아이디, 닉네임, 비밀번호, 이메일은 필수 입력 항목입니다.");
      return;
    }

    // 회원가입 API 호출
    const result = await registerAPI({
      userId,
      nickname,
      password,
      email,
      universityName: universityName || undefined,
      department: department || undefined,
      grade: grade || undefined,
    });

    if (result.success) {
      alert("회원가입이 완료되었습니다!");
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
          <Input name="userid" placeholder="아이디 (로그인용)" />
          <Input name="nickname" placeholder="닉네임" />
          <Input name="password" placeholder="비밀번호" type="password" />
          <Input name="email" placeholder="이메일" type="email" />
          <Input name="universityName" placeholder="대학교명 (선택)" />
          <Input name="department" placeholder="학과 (선택)" />
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
