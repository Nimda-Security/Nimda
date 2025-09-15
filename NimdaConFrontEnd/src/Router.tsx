import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "@/App";
import LoginPage from "@/domains/User/Login/Page";
import Home from "@/App";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
