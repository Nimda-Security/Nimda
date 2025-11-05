import "@/App.css";
import BlackButton from "@/components/Button/Black";
import Layout from "@/components/Layout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/Input";
import { registerAPI } from "@/api/auth";

function LogInPage() {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // 폼의 기본 제출 동작 방지

    // FormData로 폼의 모든 input 값 수집
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get("username") as string;
    const userid = formData.get("userid") as string;
    const password = formData.get("password") as string;

    if (!username || !userid || !password) {
      alert("모든 필드에 값을 입력해 주세요.");
      return;
    }

    // 회원가입 API 호출...해줘...
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
      <div className="flex flex-col items-center justify-center pt-24">
        <h1 className="text-3xl font-bold mb-12">NIMDA CON</h1>
        <div className="text-xl font-bold mb-4">회원가입</div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input placeholder="이름" />
          <Input placeholder="아이디" />
          <Input placeholder="비밀번호" />

          <BlackButton type="submit" onClick={goToSignUp}>
            회원가입
          </BlackButton>

          {/* test code*/}
          <BlackButton type="button" onClick={goToLogIn}>
            로그인
          </BlackButton>
        </form>
      </div>
    </Layout>
  );
}

export default LogInPage;
