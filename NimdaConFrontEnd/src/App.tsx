import './App.css'
import Button from '@/components/Button/Black'
import NavBar from './components/Layout/NavBar/NavBar'
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  const goToLogIn = () => {
    navigate("/login");
  };


  return (
    /* w-full : full width */
    <div className="w-full">
      <NavBar />
      <main className="pt-24 px-8 pb-8">
        <Button onClick={goToLogIn}>
        버튼버튼
      </Button>
      </main>
    </div>
  )
}

export default App
