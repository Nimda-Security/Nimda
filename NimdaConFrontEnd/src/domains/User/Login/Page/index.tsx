import '@/App.css'
import BlackButton from '@/components/Button/Black'
import Components from '@/components/Layout/Layout'
import BlackLineBtn from '@/components/Button/BlackLine'
import { useNavigate } from "react-router-dom";

function LogInPage() {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate("/");
  };


  return (
    <Components>
      <BlackButton onClick={goToHome}>
        버튼버튼
      </BlackButton>
    </Components>
  )
}

export default LogInPage
