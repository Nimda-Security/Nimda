import "@/App.css";
import Layout from "@/components/Layout";
import Banner from "./components/banner";
import { useNavigate } from "react-router-dom";

import { getCurrentNickname, isAdmin } from "@/utils/jwt"; // 현재 로그인한 유저 출력
import { useState, useEffect } from "react";

function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center gap-4 -mt-16">
        <Banner />
      </div>
    </Layout>
  );
}

export default Home;
