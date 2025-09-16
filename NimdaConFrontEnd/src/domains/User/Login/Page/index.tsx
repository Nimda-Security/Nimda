import "@/App.css";
import BlackButton from "@/components/Button/Black";
import Layout from "@/components/Layout/Layout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/Input";

function LogInPage() {
  
  // 기존 코드 (주석 처리)
  // const handleLogin = (e: React.FormEvent) => {
  //   e.preventDefault(); // 폼의 기본 제출 동작 방지
  //   // 여기에 로그인 API 호출 로직 추가
  // };

  // 새로운 상태 관리
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // 기존 코드 (주석 처리)
  // const goToLogIn = () => {
  //   navigate("/login");
  // };
  
  const goToSignUp = () => {
    navigate("/signup");
  };

  // 새로운 로그인 처리 함수
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log('로그인 시도:', { username, password });

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      console.log('응답 상태:', response.status);
      const data = await response.json();
      console.log('응답 데이터:', data);

      if (response.ok) {
        // 로그인 성공
        console.log('로그인 성공!');
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        // 로그인 실패
        console.log('로그인 실패:', data.message);
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.log('네트워크 에러:', error);
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center pt-14">
        <h1 className="text-3xl font-bold mb-12">NIMDA CON</h1>
        <div className="text-xl font-bold mb-4">로그인</div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* 기존 코드 (주석 처리) */}
          {/* <div>이름</div>
          <Input placeholder="이름" />
          <Input placeholder="아이디" />
          <Input placeholder="비밀번호" /> */}

          {/* 새로운 입력 필드 */}
          <div>아이디</div>
          <input
            type="text"
            className="px-4 py-2 border-1 border-gray-200 bg-white rounded-md outline-none"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          <div>비밀번호</div>
          <input
            type="password"
            className="px-4 py-2 border-1 border-gray-200 bg-white rounded-md outline-none"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* 에러 메시지 표시 */}
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {/* 기존 코드 (주석 처리) */}
          {/* <BlackButton type="submit" onClick={goToLogIn}>
            로그인
          </BlackButton> */}
          
          {/* 새로운 버튼 */}
          <BlackButton type="submit">
            로그인
          </BlackButton>
          
          {/* test code*/}
          <BlackButton type="button" onClick={goToSignUp}>
            회원가입
          </BlackButton>
        </form>
      </div>
    </Layout>
  );
}

export default LogInPage;
