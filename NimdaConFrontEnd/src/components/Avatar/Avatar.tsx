import React from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number | string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt = '', size = 40, className = '' }) => {
  const sizeStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : { width: size, height: size };

  // Treat explicit default profile strings as null to trigger our custom UI
  const effectiveSrc = (src === '/default_user_profile.png' || !src) ? null : src;

  if (effectiveSrc) {
    return (
      <img
        src={effectiveSrc}
        alt={alt}
        className={`rounded-full object-cover border border-gray-100 ${className}`}
        style={sizeStyle}
        onError={(e) => {
          // If image fails to load, switch to default
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) {
            const fallback = document.createElement('div');
            fallback.className = `rounded-full bg-[#f3f4f6] flex items-center justify-center border border-gray-100 ${className}`;
            Object.assign(fallback.style, sizeStyle);
            
            const logo = document.createElement('img');
            logo.src = '/nimdalogo_b 1.svg';
            logo.className = 'opacity-20';
            logo.style.width = '40%';
            logo.style.height = '40%';
            
            fallback.appendChild(logo);
            parent.appendChild(fallback);
          }
        }}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-[#f3f4f6] flex items-center justify-center border border-gray-100 ${className}`}
      style={sizeStyle}
    >
      <img
        src="/nimdalogo_b 1.svg"
        alt="Default Logo"
        className="opacity-20"
        style={{ width: '40%', height: '40%' }}
      />
    </div>
  );
};

export default Avatar;
