import "@/App.css";
import BlackButton from "@/components/Button/Black";
import Layout from "@/components/Layout/Layout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/Input";
import { loginAPI } from "@/api/auth";

function LogInPage() {
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼의 기본 제출 동작 방지

    // FormData로 폼의 모든 input 값 수집
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // 입력값 검증
    if (!username || !password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    // 로그인 API 호출
    const result = await loginAPI({ username, password });
    
    if (result.success) {
      alert('로그인 성공!');
      navigate('/'); // 메인 페이지로 이동
    } else {
      alert(result.message);
    }
  };

  const navigate = useNavigate();

  const goToLogIn = () => {
    navigate("/login");
  };
  
  const goToSignUp = () => {
    navigate("/signup");
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center pt-14">
        <h1 className="text-3xl font-bold mb-12">NIMDA CON</h1>
        <div className="text-xl font-bold mb-4">로그인</div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">

          <Input name="username" placeholder="아이디" />
          <Input name="password" placeholder="비밀번호" type="password" />

          <BlackButton type="submit">
            로그인
          </BlackButton>

          <BlackButton type="button" onClick={goToSignUp}>
            회원가입
          </BlackButton>

        </form>
      </div>
    </Layout>
  );
}

export default LogInPage;
