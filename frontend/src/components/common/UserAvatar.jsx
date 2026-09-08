import React from 'react';
import { User } from 'lucide-react';

/**
 * Reusable UserAvatar Component
 * Renders user's uploaded avatar image if provided, or clean initials / silhouette icon if not uploaded.
 */
export const UserAvatar = ({
  src,
  name = 'User',
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className = '',
  iconSize,
}) => {
  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-28 h-28 text-4xl',
  };

  const defaultIconSizes = {
    xs: 12,
    sm: 14,
    md: 18,
    lg: 24,
    xl: 32,
    '2xl': 44,
  };

  // Get uppercase initials (e.g., "John Doe" => "JD", "Admin" => "A")
  const getInitials = (str) => {
    if (!str || typeof str !== 'string') return 'U';
    const parts = str.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isUploadedImage = Boolean(src && typeof src === 'string' && !src.includes('unsplash.com'));

  if (isUploadedImage) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size] || sizeClasses.md} rounded-xl object-cover ring-2 ring-slate-200/80 shadow-sm shrink-0 ${className}`}
        onError={(e) => {
          // Hide broken image on error
          e.target.style.display = 'none';
        }}
      />
    );
  }

  // Fallback: Clean styled initials badge with soft gradient
  return (
    <div
      className={`${sizeClasses[size] || sizeClasses.md} rounded-xl bg-gradient-to-tr from-[#6A54F4] to-[#5844E5] text-white font-extrabold flex items-center justify-center shadow-sm shrink-0 select-none ${className}`}
    >
      {name ? (
        <span>{getInitials(name)}</span>
      ) : (
        <User size={iconSize || defaultIconSizes[size] || 18} />
      )}
    </div>
  );
};

export default UserAvatar;
