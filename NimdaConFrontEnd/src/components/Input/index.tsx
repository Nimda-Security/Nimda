import type { ChangeEvent } from "react";

/**
 * * Component * 
 * * placeholder : 필수, 입력 필드 안내 텍스트 
 * * name : 선택, HTML Input의 name 속성 
 * * type : 선택, 기본값 "Text", password, email ... 
 */
export const Input = ({ 
  placeholder, 
  name, 
  type = "text" 
}: { 
  placeholder: string;
  name?: string;
  type?: string;
}) => {
  
  return (
    <input
      name={name}
      type={type}
      className="px-4 py-2 border-1 border-gray-200 bg-white rounded-md outline-none"
      placeholder={placeholder}
    />
  );
};
