import React from 'react';

// 버튼의 props 타입 정의
interface ButtonProps {
  children: React.ReactNode; // 버튼콘안에 들어갈 텍스트 or 아이콘
  onClick?: () => void;      // 버튼을 클릭했을 때 실행될 함수 (선택적)
  type?: 'button' | 'submit'; // 버튼 type
}

function BlackLineButton({ children, onClick, type = 'button' }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      // Tailwind
      className="
        bg-transparent    /* 배경색: 투명 */
        border-2            /* 테두리 추가 */
        border-black      /* 테두리 색: 검은색 */
        text-black        /* 글자색: 검은색 */
        font-bold         /* 글자 두께: 굵게 */
        py-2 px-4         /* 패딩 */
        rounded           /* 모서리: 둥글게 */
        hover:bg-black    /* 마우스 올리면 배경색: 검은색 */
        hover:text-white  /* 마우스 올리면 글자색: 흰색 */
        transition-colors /* 색상 변경 시 부드러운 효과 */
      "
    >
      {children}
    </button>
  );
}

export default BlackLineButton;