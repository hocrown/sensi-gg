'use client';

import { useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

interface LikeButtonProps {
  setupId: string;
  initialCount: number;
  initialLiked: boolean;
  isLoggedIn: boolean;
}

export function LikeButton({ setupId, initialCount, initialLiked, isLoggedIn }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!isLoggedIn) return;
    if (loading) return;

    // Optimistic update
    setLiked(!liked);
    setCount(prev => liked ? prev - 1 : prev + 1);
    setLoading(true);

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setup_id: setupId }),
      });

      if (!res.ok) {
        // Revert optimistic update
        setLiked(liked);
        setCount(count);
      } else {
        const data = await res.json();
        setLiked(data.liked);
        setCount(data.totalLikes);
      }
    } catch {
      setLiked(liked);
      setCount(count);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={!isLoggedIn || loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
        liked
          ? 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30'
          : 'bg-deep-periwinkle/30 border-deep-periwinkle/50 text-text-secondary hover:text-cloud-white hover:border-text-muted'
      } ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={!isLoggedIn ? '로그인 후 이용 가능합니다' : ''}
    >
      <span>{liked ? '❤️' : '🤍'}</span>
      <span>{count}</span>
    </button>
  );
}
