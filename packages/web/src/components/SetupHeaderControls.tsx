'use client';

import { useRef, useEffect, useState } from 'react';
import { ChevronDown, Check, Plus } from 'lucide-react';
import { useLang } from '@/lib/i18n';

export function SetupHeaderControls() {
  const { lang, setLang } = useLang();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="flex items-center gap-3">
      {/* Auto-saving indicator */}
      <span className="text-xs text-green-400/80 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
        Auto-saving
      </span>

      {/* Language toggle */}
      <div className="bg-black/40 border border-white/10 rounded-full px-1 py-1 flex gap-1">
        <button
          onClick={() => setLang('EN')}
          className={`rounded-full px-3 py-0.5 text-xs font-semibold transition-colors ${
            lang === 'EN'
              ? 'bg-[rgba(253,199,0,0.3)] border border-[rgba(253,199,0,0.5)] text-[#fff085]'
              : 'border border-transparent text-white/50 hover:text-white/70'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLang('KR')}
          className={`rounded-full px-3 py-0.5 text-xs font-semibold transition-colors ${
            lang === 'KR'
              ? 'bg-[rgba(253,199,0,0.3)] border border-[rgba(253,199,0,0.5)] text-[#fff085]'
              : 'border border-transparent text-white/50 hover:text-white/70'
          }`}
        >
          한글
        </button>
      </div>

      {/* Profile dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setProfileOpen((v) => !v)}
          className="bg-[rgba(42,43,85,0.8)] border border-white/20 rounded-[14px] px-4 py-2 flex items-center gap-2 text-sm font-semibold text-white shadow-lg hover:border-white/30 transition-colors"
        >
          Main Setup
          <ChevronDown
            size={14}
            className={`text-white/60 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {profileOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-[rgba(26,26,58,0.95)] border border-white/10 rounded-xl shadow-2xl p-2 z-50">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/90 bg-white/5 hover:bg-white/10 transition-colors"
              onClick={() => setProfileOpen(false)}
            >
              <Check size={14} className="text-[#fff085]" />
              <span className="font-medium">Main Setup</span>
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors mt-1"
              onClick={() => setProfileOpen(false)}
            >
              <Plus size={14} />
              <span>Add New Profile</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
