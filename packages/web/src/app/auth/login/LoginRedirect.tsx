'use client';

import { useEffect } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

export function LoginRedirect() {
  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/setup/me`,
      },
    });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-text-secondary">Redirecting to Discord login...</p>
    </div>
  );
}
