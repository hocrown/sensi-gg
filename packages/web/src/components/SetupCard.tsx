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
      className="block group rounded-2xl border border-white/10 bg-[rgba(26,26,58,0.4)] hover:border-fairy-gold/20 hover:shadow-[0_0_30px_rgba(244,210,122,0.08)] transition-all duration-300 p-5"
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
          <div className="text-xs text-white/40">
            {new Date(setup.updated_at).toLocaleDateString('ko-KR')}
          </div>
        </div>
      </div>

      <div className="flex gap-3 text-sm mb-3">
        <div className="bg-white/5 rounded-lg px-3 py-1.5">
          <span className="text-white/40 text-xs">DPI </span>
          <span className="text-cloud-white font-medium">{setup.dpi}</span>
        </div>
        <div className="bg-white/5 rounded-lg px-3 py-1.5">
          <span className="text-white/40 text-xs">Sens </span>
          <span className="text-cloud-white font-medium">{setup.general_sens}</span>
        </div>
        <div className="bg-white/5 rounded-lg px-3 py-1.5">
          <span className="text-white/40 text-xs">eDPI </span>
          <span className="text-fairy-gold font-medium">{edpi.toLocaleString()}</span>
        </div>
      </div>

      {setup.mouse && (
        <p className="text-xs text-white/40 truncate">🖱 {setup.mouse}</p>
      )}
    </Link>
  );
}
