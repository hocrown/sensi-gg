'use client';

import { useState } from 'react';
import { SetupCard } from './SetupCard';

type FilterTab = 'all' | 'pro' | 'regular';

interface SetupGalleryProps {
  setups: any[];
  total: number;
  page: number;
  totalPages: number;
  tag?: string;
  serverSetups?: any[];
  serverName?: string | null;
  isLoggedIn?: boolean;
}

export function SetupGallery({
  setups,
  total,
  page,
  totalPages,
  tag,
  serverSetups = [],
  serverName,
  isLoggedIn = false,
}: SetupGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  // Check if is_pro field exists in data
  const hasProField =
    setups.some((s) => s.profiles && 'is_pro' in s.profiles) ||
    serverSetups.some((s) => s.profiles && 'is_pro' in s.profiles);

  // Filter setups based on active tab
  // If is_pro field doesn't exist yet, all tabs show all setups
  const filteredSetups =
    activeFilter === 'all' || !hasProField
      ? setups
      : activeFilter === 'pro'
      ? setups.filter((s) => s.profiles?.is_pro === true)
      : setups.filter((s) => !s.profiles?.is_pro);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pro', label: 'Pro Gamers' },
    { key: 'regular', label: 'Regular' },
  ];

  if (setups.length === 0 && serverSetups.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🎮</div>
        <h2 className="text-xl text-white/60 mb-2">아직 등록된 세팅이 없습니다</h2>
        <p className="text-white/30">Discord 봇이나 웹에서 첫 번째 세팅을 등록해보세요!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs + Count */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {tabs.map(({ key, label }) => {
          const isActive = activeFilter === key;
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={[
                'px-4 py-1.5 rounded-full border text-sm font-medium transition-all cursor-pointer',
                isActive
                  ? 'bg-fairy-gold/10 border-fairy-gold/30 text-fairy-gold'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white/70 hover:border-white/20',
              ].join(' ')}
            >
              {label}
              {!hasProField && key !== 'all' && (
                <span className="ml-1 text-[10px] text-white/30">(soon)</span>
              )}
            </button>
          );
        })}
        <span className="ml-auto text-white/40 text-sm bg-white/5 border border-white/10 rounded-full px-3 py-1">
          총 {total}개의 세팅
        </span>
      </div>

      {/* My Server Section */}
      {isLoggedIn && serverSetups.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-fairy-gold/30 to-transparent" />
            <h2 className="text-xs font-semibold text-fairy-gold/80 tracking-[0.2em] uppercase whitespace-nowrap">
              My Server · {serverName}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-fairy-gold/30 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {serverSetups.map((setup) => (
              <SetupCard key={setup.id} setup={setup} />
            ))}
          </div>
        </div>
      )}

      {/* All Setups Section header (only when server section is shown) */}
      {isLoggedIn && serverSetups.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-white/10" />
          <h2 className="text-xs font-medium text-white/30 tracking-[0.2em] uppercase">All Setups</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>
      )}

      {/* Main Grid */}
      {filteredSetups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSetups.map((setup) => (
            <SetupCard key={setup.id} setup={setup} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-white/30 text-sm">
          해당 필터에 맞는 세팅이 없습니다
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {page > 1 && (
            <a
              href={`/?page=${page - 1}${tag ? `&tag=${tag}` : ''}`}
              className="bg-white/5 border border-white/10 rounded-full px-5 py-2 text-white/60 hover:text-white hover:border-white/20 transition-all text-sm"
            >
              ← 이전
            </a>
          )}
          <span className="px-4 py-2 text-sm text-white/40 bg-white/5 border border-white/10 rounded-full">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/?page=${page + 1}${tag ? `&tag=${tag}` : ''}`}
              className="bg-white/5 border border-white/10 rounded-full px-5 py-2 text-white/60 hover:text-white hover:border-white/20 transition-all text-sm"
            >
              다음 →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
