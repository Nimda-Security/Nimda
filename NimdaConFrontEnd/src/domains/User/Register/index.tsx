import "@/App.css";
import BlackButton from "@/components/Button/Black";
import Layout from "@/components/Layout/Layout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/Input";

function LogInPage() {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // 폼의 기본 제출 동작 방지
    // 여기에 로그인 API 호출 로직 추가
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
        <div className="text-xl font-bold mb-4">회원가입</div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>아이디</div>
          <Input placeholder="아이디" />
          <Input placeholder="비밀번호z" />

          <BlackButton type="submit" onClick={goToSignUp}>
            회원가입
          </BlackButton>
          {/* test code*/}
          <BlackButton type="submit" onClick={goToLogIn}>
            로그인
          </BlackButton>
        </form>
      </div>
    </Layout>
  );
}

export default LogInPage;
