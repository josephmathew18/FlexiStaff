import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Logo = ({ to = '/', size = 'md', variant = 'auto', className = '' }) => {
  const { effectiveTheme } = useTheme();

  const iconSizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  const iconInnerSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
  };

  // Determine dark vs light mode for logo text visibility
  const isDark = variant === 'dark' ? true : variant === 'light' ? false : effectiveTheme === 'dark';

  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const aiColor = isDark ? 'text-[#7B66FF]' : 'text-[#6A54F4]';
  const subtitleColor = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <Link to={to} className={`flex items-center gap-2.5 group ${className}`}>
      {/* Purple Rounded Square Icon Box with Briefcase Icon */}
      <div className={`${iconSizes[size] || iconSizes.md} bg-[#6A54F4] text-white flex items-center justify-center shadow-lg shadow-purple-950/30 group-hover:scale-105 transition-transform flex-shrink-0`}>
        <Briefcase size={iconInnerSizes[size] || 20} className="stroke-[2.2]" />
      </div>

      {/* FlexiStaffAI Text with WORKFORCE MANAGEMENT Subtitle */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`${textSizes[size] || textSizes.md} font-extrabold tracking-tight ${textColor} flex items-center transition-colors`}>
          <span>FlexiStaff</span>
          <span className={aiColor}>AI</span>
        </div>
        <span className={`${subtitleSizes[size] || subtitleSizes.md} font-semibold ${subtitleColor} tracking-wider uppercase mt-1 transition-colors`}>
          WORKFORCE MANAGEMENT
        </span>
      </div>
    </Link>
  );
};

export default Logo;
