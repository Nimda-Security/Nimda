import React from "react";
import Logo from "/public/nimda.png";

const BrandSection: React.FC = () => {
  return (
    <div className="flex items-center">
      <img src="/nimda.png" alt="picture1" width="20" className="mr-2" />
      <div className="text-[#1A1A1A] font-inter text-xl font-bold leading-[30px] tracking-[-0.2px] mt-4 mb-4">
        NIMDA
      </div>
    </div>
  );
};

export default BrandSection;

// React.FC -> TypeScript에서 React 컴포넌트를 정의할 때 사용하는 타입
