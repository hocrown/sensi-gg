'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { UserAvatar } from './UserAvatar';

export function LoginButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-deep-periwinkle animate-pulse" />;
  }

  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url;
    const username = user.user_metadata?.full_name || user.user_metadata?.name || 'User';

    return (
      <div className="flex items-center gap-3">
        <UserAvatar src={avatarUrl} username={username} size={32} />
        <span className="text-sm text-text-secondary hidden sm:block">{username}</span>
        <button
          onClick={handleLogout}
          className="text-xs text-text-muted hover:text-cloud-white transition-colors px-2 py-1 rounded border border-deep-periwinkle/50 hover:border-text-muted"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-medium transition-colors"
    >
      <svg width="16" height="12" viewBox="0 0 71 55" fill="currentColor">
        <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 41 41 0 00-1.8 3.7 54 54 0 00-16.2 0A37.3 37.3 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 5a.2.2 0 00-.1 0A60.4 60.4 0 00.4 45.3a.2.2 0 000 .2A58.7 58.7 0 0018.1 55a.2.2 0 00.2-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 41.8 41.8 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.3 36.3 0 01-5.5 2.7.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.8.2.2 0 00.2.1A58.5 58.5 0 0070.2 45.5a.2.2 0 000-.2A60 60 0 0049.8 4.9a.2.2 0 00-.1 0zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.1 6.4-7.1 6.5 3.2 6.4 7.1c0 4-2.8 7.2-6.4 7.2zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.1 6.4-7.1 6.5 3.2 6.4 7.1c0 4-2.9 7.2-6.4 7.2z"/>
      </svg>
      Discord로 로그인
    </button>
  );
}
