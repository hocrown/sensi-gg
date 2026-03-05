import Link from 'next/link';
import { UserAvatar } from './UserAvatar';
import { SectionBadge } from './SectionBadge';

interface SetupCardProps {
  setup: {
    id: string;
    sens?: string | null;
    gear?: string | null;
    game?: string | null;
    tips?: string | null;
    created_at: string;
    like_count?: number;
    profiles: {
      username: string;
      avatar_url?: string | null;
    };
  };
}

export function SetupCard({ setup }: SetupCardProps) {
  const sections = ['sens', 'gear', 'game', 'tips'].filter(
    s => setup[s as keyof typeof setup]
  );

  return (
    <Link
      href={`/setup/${setup.id}`}
      className="block group rounded-xl border border-deep-periwinkle/50 bg-soft-navy/50 hover:bg-soft-navy/80 hover:border-fairy-gold/30 transition-all duration-200 p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <UserAvatar
          src={setup.profiles.avatar_url}
          username={setup.profiles.username}
          size={36}
        />
        <div>
          <div className="font-medium text-cloud-white group-hover:text-fairy-gold transition-colors">
            {setup.profiles.username}
          </div>
          <div className="text-xs text-text-muted">
            {new Date(setup.created_at).toLocaleDateString('ko-KR')}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {sections.map(s => (
          <SectionBadge key={s} section={s} />
        ))}
      </div>

      {setup.sens && (
        <p className="text-sm text-text-secondary line-clamp-2">
          {setup.sens}
        </p>
      )}

      <div className="mt-3 flex items-center text-text-muted text-xs">
        <span>❤️ {setup.like_count ?? 0}</span>
      </div>
    </Link>
  );
}
