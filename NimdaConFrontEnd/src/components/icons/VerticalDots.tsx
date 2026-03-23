import React from "react";

interface VerticalDotsProps {
  size?: number;
}

export const VerticalDots: React.FC<VerticalDotsProps> = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {[5, 12, 19].map((cy) => (
      <circle
        key={cy}
        cx="12"
        cy={cy}
        r="1"
        stroke="#BCBCBC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ))}
  </svg>
);