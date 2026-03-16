import React from "react";
import NavBar from "./Header/NavBar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  /** true면 로그인/회원가입 등에서 사이드바 숨김 */
  hideSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideSidebar }) => {
  return (
    <div className="layout">
      <NavBar />

      <div className={`layout__body ${hideSidebar ? "layout__body--no-sidebar" : ""}`}>
        <div className={`layout__container ${hideSidebar ? "layout__container--no-sidebar" : ""}`}>
          {!hideSidebar && <Sidebar />}

          <main className={`layout__content ${hideSidebar ? "layout__content--full" : ""}`}>
            {children}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
