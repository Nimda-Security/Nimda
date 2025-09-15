import "@/App.css";
import BlackButton from "@/components/Button/Black";
import Layout from "@/components/Layout/Layout";
import FormField from "@/components/Form/FormField";
import { useState } from "react";
import { Input } from "@/components/Input";

function LogInPage() {
  const [name, setName] = useState("");
  const [id, setID] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // 폼의 기본 제출 동작 방지
    alert(`Name: ${name}, ID: ${id}, Password: ${password}`);
    // 여기에 로그인 API 호출 로직 추가
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center pt-16">
        <h1 className="text-3xl font-bold mb-8">NIMDA CON</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>이름</div>

          <Input placeholder="이름" />
          <Input placeholder="아이디" />
          <Input placeholder="비밀번호z" />

          <BlackButton type="submit">로그인</BlackButton>
        </form>
      </div>
    </Layout>
  );
}

export default LogInPage;
