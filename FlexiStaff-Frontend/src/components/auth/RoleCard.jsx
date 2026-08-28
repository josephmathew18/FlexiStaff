import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export const RoleCard = ({
  role,
  title,
  description,
  icon: Icon,
  isSelected,
  onSelect,
}) => {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(role)}
      className={`relative flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all duration-200 w-full ${
        isSelected
          ? 'border-[#2563eb] bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white shadow-md shadow-blue-500/10 ring-2 ring-[#2563eb]/20'
          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60'
      }`}
    >
      {/* Top row: Icon + Checkmark if selected */}
      <div className="flex items-center justify-between w-full mb-2">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white shadow-sm'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          <Icon size={18} />
        </div>

        {isSelected && (
          <span className="w-5 h-5 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-[10px] shadow-xs">
            <Check size={12} strokeWidth={3} />
          </span>
        )}
      </div>

      {/* Role Title */}
      <h3
        className={`text-xs font-bold tracking-tight mb-0.5 ${
          isSelected ? 'text-[#004ac6]' : 'text-slate-900'
        }`}
      >
        {title}
      </h3>

      {/* Role Description */}
      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
        {description}
      </p>
    </motion.button>
  );
};

export default RoleCard;
