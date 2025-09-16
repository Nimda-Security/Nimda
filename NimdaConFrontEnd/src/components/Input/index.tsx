import { useState } from "react";
import type { ChangeEvent } from "react";

export const Input = ({ placeholder }: { placeholder: string }) => {
  
  const [value, setValue] = useState("");

  return (
    <input
      className="px-4 py-2 border-1 border-gray-200 bg-white rounded-md outline-none"
      placeholder={placeholder}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        console.log(e);
        setValue(e.target.value);
      }}
    />
  );
};
