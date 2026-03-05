import Link from 'next/link';
import { UserAvatar } from './UserAvatar';

interface SetupCardProps {
  setup: {
    id: string;
    dpi: number;
    general_sens: number;
    mouse?: string | null;
    keyboard?: string | null;
    updated_at: string;
    profiles: {
      display_name: string;
      avatar_url?: string | null;
      handle?: string | null;
    };
  };
}

export function SetupCard({ setup }: SetupCardProps) {
  const edpi = Math.round(setup.dpi * setup.general_sens);

  return (
    <Link
      href={`/setup/${setup.id}`}
      className="block group rounded-xl border border-deep-periwinkle/50 bg-soft-navy/50 hover:bg-soft-navy/80 hover:border-fairy-gold/30 transition-all duration-200 p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <UserAvatar
          src={setup.profiles.avatar_url}
          username={setup.profiles.display_name}
          size={36}
        />
        <div>
          <div className="font-medium text-cloud-white group-hover:text-fairy-gold transition-colors">
            {setup.profiles.display_name}
          </div>
          <div className="text-xs text-text-muted">
            {new Date(setup.updated_at).toLocaleDateString('ko-KR')}
          </div>
        </div>
      </div>

      <div className="flex gap-4 text-sm mb-3">
        <div>
          <span className="text-text-muted text-xs">DPI </span>
          <span className="text-cloud-white font-medium">{setup.dpi}</span>
        </div>
        <div>
          <span className="text-text-muted text-xs">Sens </span>
          <span className="text-cloud-white font-medium">{setup.general_sens}</span>
        </div>
        <div>
          <span className="text-text-muted text-xs">eDPI </span>
          <span className="text-fairy-gold font-medium">{edpi.toLocaleString()}</span>
        </div>
      </div>

      {setup.mouse && (
        <p className="text-xs text-text-muted truncate">🖱 {setup.mouse}</p>
      )}
    </Link>
  );
}
