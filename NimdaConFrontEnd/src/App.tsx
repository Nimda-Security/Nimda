import "./App.css";
import Layout from "@/components/Layout";
import BlackLineButton from "@/components/Button/BlackLine";
import { useNavigate } from "react-router-dom";

import { getCurrentUsername, isAdmin } from "@/utils/jwt"; // 현재 로그인한 유저 출력
import { useState, useEffect } from "react";

function App() {
  const navigate = useNavigate();

  const [username, setUsername] = useState<string | null>(null);
  const [adminStatus, setAdminStatus] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUsername();
    const adminCheck = isAdmin();
    setUsername(currentUser);
    setAdminStatus(adminCheck);
  }, []);

  const goToLogIn = () => {
    navigate("/login");
  };

  const goToProblems = () => {
    navigate("/problems");
  };

  const goToAdmin = () => {
    navigate("/admin");
  };

  return (
    <Layout>
      <div className="flex flex-col items-center gap-4"></div>
    </Layout>
  );
}

export default App;
