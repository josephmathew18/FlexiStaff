import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeDropdown = ({ className = '', buttonClassName = '' }) => {
  const { themeMode, setThemeMode, effectiveTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeOptions = [
    {
      id: 'auto',
      label: 'Auto',
      description: 'Use the same theme as your device',
      icon: Laptop,
    },
    {
      id: 'light',
      label: 'Light',
      description: 'Light background with dark text',
      icon: Sun,
    },
    {
      id: 'dark',
      label: 'Dark',
      description: 'Dark background with light text',
      icon: Moon,
    },
  ];

  const currentOption = themeOptions.find((opt) => opt.id === themeMode) || themeOptions[0];
  const CurrentIcon = currentOption.icon;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Header Button matching user screenshot */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
          effectiveTheme === 'dark'
            ? 'bg-[#141324] border-white/15 text-white hover:bg-[#1f1d38]'
            : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200/80'
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2">
          <CurrentIcon size={16} className="text-[#6A54F4] shrink-0" />
          <span>Theme: <strong className="capitalize">{currentOption.label}</strong></span>
        </div>
        {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>

      {/* Dropdown Options Box matching user screenshot */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border p-2 z-50 transition-all ${
            effectiveTheme === 'dark'
              ? 'bg-[#141324] border-white/15 text-white shadow-black/80'
              : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
          }`}
        >
          <div className="space-y-1">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = themeMode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setThemeMode(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                    isSelected
                      ? effectiveTheme === 'dark'
                        ? 'bg-[#6A54F4]/20 border border-[#6A54F4]/40 text-white'
                        : 'bg-purple-50 border border-purple-200 text-slate-900'
                      : effectiveTheme === 'dark'
                      ? 'hover:bg-white/5 text-slate-300'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Icon
                    size={18}
                    className={`mt-0.5 shrink-0 ${
                      isSelected ? 'text-[#6A54F4]' : 'text-slate-400'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{option.label}</span>
                      {isSelected && <Check size={14} className="text-[#6A54F4]" />}
                    </div>
                    <p className={`text-[11px] mt-0.5 ${
                      effectiveTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeDropdown;
