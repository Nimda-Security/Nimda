import React from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number | string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt = '', size = 40, className = '' }) => {
  const sizeStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : { width: size, height: size };

  const DEFAULT_PROFILE = '/default_user_profile.png';
  const effectiveSrc = src && src !== DEFAULT_PROFILE ? src : DEFAULT_PROFILE;

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className={`rounded-full object-cover border border-gray-100 ${className}`}
      style={sizeStyle}
      onError={(e) => {
        // If image fails to load, fall back to default profile
        if (e.currentTarget.src !== DEFAULT_PROFILE) {
          e.currentTarget.src = DEFAULT_PROFILE;
        }
      }}
    />
  );
};

export default Avatar;
