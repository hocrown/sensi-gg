'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { GEAR_CATALOG, GearCategoryKey } from '@/lib/gear-catalog';

interface GearSelectorProps {
  category: GearCategoryKey;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const inputCls =
  'w-full px-4 py-3 rounded-[14px] bg-[rgba(13,13,32,0.5)] border border-white/10 text-cloud-white text-base focus:border-fairy-gold/40 focus:outline-none focus:ring-1 focus:ring-fairy-gold/20 transition-colors placeholder:text-text-muted';

export function GearSelector({ category, value, onChange, placeholder, className }: GearSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const brands = GEAR_CATALOG[category] ?? [];

  const filtered = brands
    .map(b => ({
      brand: b.brand,
      products: b.products.filter(p =>
        `${b.brand} ${p.name}`.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(b => b.products.length > 0);

  const handleSelect = useCallback((brand: string, product: string) => {
    onChange(`${brand} ${product}`);
    setOpen(false);
    setSearch('');
  }, [onChange]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      {/* Main input */}
      <div className="relative">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          className={`${inputCls} pr-10`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setOpen(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-cloud-white transition-colors"
          aria-label="Toggle dropdown"
        >
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 top-full mt-2 left-0 right-0 rounded-xl border border-white/10 shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(13,13,32,0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Search input */}
          <div className="p-2 border-b border-white/10">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-cloud-white text-sm focus:outline-none focus:border-fairy-gold/30 placeholder:text-text-muted"
              />
            </div>
          </div>

          {/* Product list */}
          <div className="overflow-y-auto max-h-64 py-1">
            {filtered.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">No results</p>
            ) : (
              filtered.map(b => (
                <div key={b.brand}>
                  {/* Brand header */}
                  <div className="px-3 py-1.5 text-xs font-semibold text-fairy-gold/70 uppercase tracking-wider">
                    {b.brand}
                  </div>
                  {/* Products */}
                  {b.products.map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleSelect(b.brand, p.name)}
                      className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-cloud-white transition-colors"
                    >
                      {b.brand} {p.name}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
