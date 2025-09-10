import React from 'react';

// 버튼의 props 타입 정의
interface ButtonProps {
  children: React.ReactNode; // 버튼콘안에 들어갈 텍스트 or 아이콘
  onClick: () => void;      // 버튼을 클릭했을 때 실행될 함수
  type?: 'button' | 'submit'; // 버튼 type
}

function Button({ children, onClick, type = 'button' }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      // Tailwind
      className="
        bg-black          /* 배경색: 검은색 */
        text-white        /* 글자색: 흰색 */
        font-bold         /* 글자 두께: 굵게 */
        py-2 px-4         /* 패딩: 상하(y) 0.5rem, 좌우(x) 1rem */
        rounded           /* 모서리: 둥글게 */
        hover:bg-blue /* 마우스를 올리면 배경색 변경 */
        transition-colors /* 색상 변경 시 부드러운 효과 */
      "
    >
      {children}
    </button>
  );
}

export default Button;