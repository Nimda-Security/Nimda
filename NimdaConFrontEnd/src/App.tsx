import './App.css'
import BlackButton from '@/components/Button/Black'
import Components from '@/components/Layout/Layout'
import BlackLineBtn from '@/components/Button/BlackLine'
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  const goToLogIn = () => {
    navigate("/login");
  };


  return (
    <Components>
      <BlackLineBtn onClick={goToLogIn}>
        버튼버튼
      </BlackLineBtn>
    </Components>
  )
}

export default App
