import React from "react";

interface ArrowLeftIconProps {
  className?: string;
  color?: string;
  size?: number;
}

const ArrowLeftIcon: React.FC<ArrowLeftIconProps> = ({
  className = "",
  color = "#8C8C8C",
  size = 24,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={21}
      viewBox="0 0 24 21"
      fill="none"
      className={className}
    >
      <path
        d="M17.7072 12.8424L18.4564 17.858C18.4675 17.9318 18.3966 17.9913 18.3258 17.9676L13.5165 16.3588C13.499 16.3529 13.4835 16.3423 13.4716 16.3282L4.54097 5.68509C4.50547 5.64278 4.51099 5.5797 4.55329 5.5442L8.61333 2.13743C8.65564 2.10193 8.71871 2.10745 8.75421 2.14975L17.6849 12.7929C17.6967 12.807 17.7044 12.8241 17.7072 12.8424Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10.7084 5.06556L6.99999 8.06554"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default ArrowLeftIcon;
