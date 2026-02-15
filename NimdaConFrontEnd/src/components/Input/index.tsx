import type { ChangeEvent } from "react";

/**
 * * Component * 
 * * placeholder : 필수, 입력 필드 안내 텍스트 
 * * name : 선택, HTML Input의 name 속성 
 * * type : 선택, 기본값 "Text", password, email ... 
 * * required : 선택, 필수 입력 여부
 * * maxLength : 선택, 최대 입력 길이
 */
export const Input = ({ 
  placeholder, 
  name, 
  type = "text",
  required,
  maxLength
}: { 
  placeholder: string;
  name?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) => {
  
  return (
    <input
      name={name}
      type={type}
      className="px-4 py-2 border-1 border-gray-200 bg-white rounded-md outline-none"
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
    />
  );
};
