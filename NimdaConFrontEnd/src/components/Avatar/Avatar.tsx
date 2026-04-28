import React from 'react';
import { resolveProfileDecorationSrc } from '@/constants/profileDecorations';

interface AvatarProps {
  src?: string | null;
  decorationKey?: string | null;
  alt?: string;
  size?: number | string;
  className?: string;
  wrapperClassName?: string;
  decorationScale?: number;
}

const DEFAULT_PROFILE = '/default_user_profile.svg';

const Avatar: React.FC<AvatarProps> = ({
  src,
  decorationKey,
  alt = '',
  size = 40,
  className = '',
  wrapperClassName = '',
  decorationScale = 1.24,
}) => {
  const sizeStyle =
    typeof size === 'number'
      ? { width: `${size}px`, height: `${size}px` }
      : { width: size, height: size };

  const effectiveSrc = src?.trim() ? src : DEFAULT_PROFILE;
  const decorationSrc = resolveProfileDecorationSrc(decorationKey);
  const decorationOffset = `${((1 - decorationScale) / 2) * 100}%`;
  const decorationSize = `${decorationScale * 100}%`;

  return (
    <span
      className={`relative inline-flex shrink-0 align-middle ${wrapperClassName}`}
      data-avatar-root="true"
      style={sizeStyle}
    >
      <img
        src={effectiveSrc}
        alt={alt}
        data-avatar-image="profile"
        className={`h-full w-full rounded-full border border-gray-100 object-cover ${className}`}
        onError={(e) => {
          if (e.currentTarget.src !== DEFAULT_PROFILE) {
            e.currentTarget.src = DEFAULT_PROFILE;
          }
        }}
      />
      {decorationSrc && (
        <img
          src={decorationSrc}
          alt=""
          aria-hidden="true"
          data-avatar-image="decoration"
          className="pointer-events-none absolute select-none object-contain"
          style={{
            left: decorationOffset,
            top: decorationOffset,
            width: decorationSize,
            height: decorationSize,
            maxWidth: 'none',
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
    </span>
  );
};

export default Avatar;
