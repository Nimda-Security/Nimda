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

          <Input placeholder="네임" />
          <Input placeholder="test" />
          <FormField>
            <input
              type="text"
              placeholder="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-full bg-transparent outline-none"
              required
            />
          </FormField>
          <div>아이디</div>
          <FormField>
            <input
              type="text"
              placeholder="아이디"
              value={id}
              onChange={(e) => setID(e.target.value)}
              className="w-full h-full bg-transparent outline-none"
              required
            />
          </FormField>
          <FormField>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-full bg-transparent outline-none"
              required
            />
          </FormField>
          <BlackButton type="submit">로그인</BlackButton>
        </form>
      </div>
    </Layout>
  );
}

export default LogInPage;
