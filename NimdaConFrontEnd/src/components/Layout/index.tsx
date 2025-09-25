import React from "react";
import NavBar from "./Header/NavBar";
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const menuItems = [
    { name: "동아리 소개", href: "/" },
    { name: "새 소식", href: "/" },
    { name: "학술 게시판", href: "/" },
    { name: "커뮤니티", href: "/" },
    { name: "대회", href: "/" },
    { name: "바로가기", href: "/" },
  ];
  return (
    <div className="w-full">
      <NavBar menuItems={menuItems} />
      <main className="w=3/4 mx-auto pt-24 px-8 pb-8">{children}</main>
    </div>
  );
};

export default Layout;
