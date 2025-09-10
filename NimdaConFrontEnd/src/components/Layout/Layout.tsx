import React from 'react';
import NavBar from './Header/NavBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="w-full">
      <NavBar />
      <main className="pt-24 px-8 pb-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
