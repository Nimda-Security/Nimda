import '@/App.css'
import Button from '@/components/Button/Black'
import NavBar from '@/components/Layout/NavBar/NavBar'


function LoginPage() {

  const handleLogin = () => {
    alert('로그인 버튼이 클릭되었습니다!');
    // 실제 로그인 처리 로직을 추가 예정
  };

  return (
    /* w-full : full width */
    <div className="w-full">


      <main className="p-8">
        <Button onClick={handleLogin}>
        로그인
      </Button>
      </main>
    </div>
  )
}

export default LoginPage
