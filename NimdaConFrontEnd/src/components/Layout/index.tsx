import React from "react";
import NavBar from "./Header/NavBar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      {/* Header: 전체 너비, 내부 1200px */}
      <NavBar />

      {/* Body: Header 고정 높이 + 간격만큼 padding-top */}
      <div className="layout__body">
        <div className="layout__container">
          {/* 사이드바: 282px */}
          <Sidebar />

          {/* 본문 콘텐츠: 894px */}
          <main className="layout__content">{children}</main>
        </div>
      </div>

      {/* Footer: 전체 너비, 내부 1200px, 높이 180px */}
      <Footer />
    </div>
  );
};

export default Layout;
