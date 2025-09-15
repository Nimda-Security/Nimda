import React from "react";

interface ArrowRightIconProps {
  className?: string;
  color?: string;
  size?: number;
}

const ArrowRightIcon: React.FC<ArrowRightIconProps> = ({
  className = "",
  color = "#8C8C8C",
  size = 24,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M15 3H7C5.89543 3 5 3.89543 5 5V16C5 17.1046 5.89543 18 7 18H15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11.5 9.25C11.0858 9.25 10.75 9.58579 10.75 10C10.75 10.4142 11.0858 10.75 11.5 10.75V10V9.25ZM23.0303 10.5303C23.3232 10.2374 23.3232 9.76256 23.0303 9.46967L18.2574 4.6967C17.9645 4.40381 17.4896 4.40381 17.1967 4.6967C16.9038 4.98959 16.9038 5.46447 17.1967 5.75736L21.4393 10L17.1967 14.2426C16.9038 14.5355 16.9038 15.0104 17.1967 15.3033C17.4896 15.5962 17.9645 15.5962 18.2574 15.3033L23.0303 10.5303ZM11.5 10V10.75L22.5 10.75V10V9.25L11.5 9.25V10Z"
        fill={color}
      />
    </svg>
  );
};

export default ArrowRightIcon;
