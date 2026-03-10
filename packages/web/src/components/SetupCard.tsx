import Link from 'next/link';
import { calculateEdpi, SENSITIVITY_BANDS } from '@sensi-gg/shared';
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

function getEdpiColorClass(edpi: number): string {
  if (edpi < SENSITIVITY_BANDS.low) return 'text-mist-blue';
  if (edpi < SENSITIVITY_BANDS.mid) return 'text-fairy-gold';
  return 'text-rose-400';
}

export function SetupCard({ setup }: SetupCardProps) {
  const edpi = calculateEdpi(setup.dpi, setup.general_sens);
  const edpiColorClass = getEdpiColorClass(edpi);

  return (
    <Link
      href={`/setup/${setup.id}`}
      className="block group rounded-2xl border border-white/10 bg-[rgba(26,26,58,0.4)] hover:border-fairy-gold/20 hover:shadow-[0_0_30px_rgba(244,210,122,0.1)] hover:scale-[1.02] transition-all duration-300 p-5 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <UserAvatar
          src={setup.profiles.avatar_url}
          username={setup.profiles.display_name}
          size={36}
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-cloud-white group-hover:text-fairy-gold transition-colors truncate">
            {setup.profiles.display_name}
          </div>
          <div className="text-xs text-white/40">
            {new Date(setup.updated_at).toLocaleDateString('ko-KR')}
          </div>
        </div>
      </div>

      <div className="flex gap-2 text-sm mb-3 flex-wrap">
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
          <span className={`${edpiColorClass} font-medium`}>{edpi.toLocaleString()}</span>
        </div>
      </div>

      {setup.mouse && (
        <span className="inline-block text-xs text-white/40 bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 truncate max-w-full">
          {setup.mouse}
        </span>
      )}
    </Link>
  );
}
