import React from 'react';
import NavBar from './Header/NavBar';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="w-full">
      <NavBar />
      <main className="pt-24 px-8 pb-8">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
