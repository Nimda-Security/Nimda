import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "@/App";
import LoginPage from "@/domains/User/Login/Page";
import SignUp from "@/domains/User/Register";
import ProblemSubmitPage from "@/domains/Test/ProblemSubmit"; // [DEBUG] 테스트용 코드 
import Home from "@/App";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/problem-submit" element={<ProblemSubmitPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
