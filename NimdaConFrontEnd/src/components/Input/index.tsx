import { useState } from "react";
import type { ChangeEvent } from "react";

/**
 * 2025.09.17
 * Input Component 변동사항
 * Form Data 사용을 위한 name, type props 추가 
 */
export const Input = ({ placeholder, name, type = "text" }: 
  { placeholder: string;
    name?: string;
    type?: string 
   }) => {
  
  const [value, setValue] = useState("");

  return (
    <input
      name = {name}
      type = {type}
      className="px-4 py-2 border-1 border-gray-200 bg-white rounded-md outline-none"
      placeholder={placeholder}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        // console.log(e);
        setValue(e.target.value);
      }}
    />
  );
};
