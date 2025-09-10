import '@/App.css'
import BlackButton from '@/components/Button/Black'
import Layout from '@/components/Layout/Layout'
import FormField from '@/components/Form/FormField'
import { useState } from 'react';

function LogInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // 폼의 기본 제출 동작 방지
    alert(`Email: ${email}, Password: ${password}`);
    // 여기에 로그인 API 호출 로직 추가
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center pt-16">
        <h1 className="text-3xl font-bold mb-8">NIMDA CON</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <FormField>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <BlackButton type="submit">
            로그인
          </BlackButton>
        </form>
      </div>
    </Layout>
  )
}

export default LogInPage
