import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Tag, Check } from 'lucide-react';

export const COMMON_SKILL_OPTIONS = [
  'react.js',
  'postgresql',
  'node.js',
  'python',
  'javascript',
  'typescript',
  'html',
  'css',
  'java',
  'spring boot',
  'aws',
  'docker',
  'mongodb',
  'graphql',
  'tailwind css',
  'express.js',
  'next.js',
  'vue.js',
  'redis',
  'kubernetes',
  'flutter',
  'c++',
  'golang',
  'sql',
  'figma',
  'devops',
  'cybersecurity',
  'machine learning',
];

export const SkillInputWithSuggestions = ({
  selectedSkills = [],
  onChange,
  label = 'Verified Technical Skills',
  placeholder = 'Type or select skill (e.g. react.js, postgresql...)',
  theme = 'purple', // 'purple' | 'blue' | 'emerald'
}) => {
  const [inputVal, setInputVal] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  const themeClasses = {
    purple: {
      badge: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/40 text-purple-800 dark:text-purple-300',
      btn: 'bg-purple-600 hover:bg-purple-700 text-white',
      border: 'focus:border-purple-600',
      tagBtn: 'hover:border-purple-400 hover:text-purple-600',
      tagActive: 'bg-purple-600 text-white border-purple-600',
    },
    blue: {
      badge: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/40 text-blue-800 dark:text-blue-300',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white',
      border: 'focus:border-blue-600',
      tagBtn: 'hover:border-blue-400 hover:text-blue-600',
      tagActive: 'bg-blue-600 text-white border-blue-600',
    },
    emerald: {
      badge: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      border: 'focus:border-emerald-600',
      tagBtn: 'hover:border-emerald-400 hover:text-emerald-600',
      tagActive: 'bg-emerald-600 text-white border-emerald-600',
    },
  }[theme] || {
    badge: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/40 text-purple-800 dark:text-purple-300',
    btn: 'bg-purple-600 hover:bg-purple-700 text-white',
    border: 'focus:border-purple-600',
    tagBtn: 'hover:border-purple-400 hover:text-purple-600',
    tagActive: 'bg-purple-600 text-white border-purple-600',
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSkill = (skillName) => {
    const trimmed = skillName.trim().toLowerCase();
    if (!trimmed) return;
    const exists = selectedSkills.some((s) => s.toLowerCase() === trimmed);
    if (!exists) {
      const updated = [...selectedSkills, trimmed];
      onChange(updated);
    }
    setInputVal('');
    setShowDropdown(false);
  };

  const removeSkill = (skillToRemove) => {
    const updated = selectedSkills.filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase());
    onChange(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputVal.trim()) {
        addSkill(inputVal);
      }
    }
  };

  const filteredSuggestions = COMMON_SKILL_OPTIONS.filter((opt) => {
    const isSelected = selectedSkills.some((s) => s.toLowerCase() === opt.toLowerCase());
    const matchesInput = opt.toLowerCase().includes(inputVal.trim().toLowerCase());
    return !isSelected && matchesInput;
  });

  return (
    <div ref={containerRef} className="space-y-3">
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {/* Selected Skill Badges */}
      <div className="flex flex-wrap gap-2">
        {selectedSkills.map((skill, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold shadow-xs ${themeClasses.badge}`}
          >
            <span>{skill}</span>
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>

      {/* Input Box & Autocomplete Dropdown */}
      <div className="relative max-w-md">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1c1a36] p-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all ${themeClasses.border}`}
            />
          </div>
          <button
            type="button"
            onClick={() => inputVal.trim() && addSkill(inputVal)}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-colors flex items-center gap-1 shrink-0 ${themeClasses.btn}`}
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>

        {/* Dropdown Menu */}
        {showDropdown && filteredSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#14132b] p-1 shadow-xl text-xs">
            {filteredSuggestions.map((skillOpt) => (
              <button
                key={skillOpt}
                type="button"
                onClick={() => addSkill(skillOpt)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between"
              >
                <span>{skillOpt}</span>
                <Plus size={13} className="text-slate-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular Preset Skill Pills */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          Popular Skill Options (Click to add)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SKILL_OPTIONS.map((skillOpt) => {
            const isAdded = selectedSkills.some((s) => s.toLowerCase() === skillOpt.toLowerCase());
            return (
              <button
                key={skillOpt}
                type="button"
                onClick={() => (isAdded ? removeSkill(skillOpt) : addSkill(skillOpt))}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
                  isAdded
                    ? themeClasses.tagActive
                    : `bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 ${themeClasses.tagBtn}`
                }`}
              >
                <span>{isAdded ? '✓' : '+'}</span>
                <span>{skillOpt}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SkillInputWithSuggestions;
