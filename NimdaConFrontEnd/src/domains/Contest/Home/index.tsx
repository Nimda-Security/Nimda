import "@/App.css";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { getCurrentUsername, isAdmin } from "@/utils/jwt"; // 현재 로그인한 유저 출력
import { useState, useEffect } from "react";

function ContestHome() {
  return (
    <Layout>
      <div className="flex flex-col items-center gap-4">Contest Main Page</div>
    </Layout>
  );
}

export default ContestHome;
