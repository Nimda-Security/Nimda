import "./App.css";
import Layout from "@/components/Layout/Layout";
import BlackLineButton from "@/components/Button/BlackLine";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  const goToLogIn = () => {
    navigate("/login");
  };

  return (
    <Layout>
      <BlackLineButton onClick={goToLogIn}>버튼버튼</BlackLineButton>
    </Layout>
  );
}

export default App;
