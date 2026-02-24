import React from "react";


const BrandSection: React.FC = () => {
  return (
    <div className="flex items-center">
      <img src="/nimda.png" alt="picture1" width="20" />
      <div 
        className="text-[#1A1A1A] text-xl tracking-[-0.2px]"
        style={{ 
          marginLeft: '8px', 
          fontWeight: 700, 
          fontFamily: 'Pretendard, sans-serif', 
          lineHeight: 1,
          position: 'relative',
          top: '2px'
        }}
      >
        NIMDA
      </div>
    </div>
  );
};

export default BrandSection;

// React.FC -> TypeScript에서 React 컴포넌트를 정의할 때 사용하는 타입
