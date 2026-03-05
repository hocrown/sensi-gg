const SECTION_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  sens: { label: '감도', emoji: '🎯', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  gear: { label: '장비', emoji: '⌨️', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  game: { label: '그래픽', emoji: '🖥️', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  tips: { label: '꿀팁', emoji: '💡', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
};

interface SectionBadgeProps {
  section: string;
  size?: 'sm' | 'md';
}

export function SectionBadge({ section, size = 'sm' }: SectionBadgeProps) {
  const config = SECTION_CONFIG[section];
  if (!config) return null;

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${config.color} ${sizeClasses}`}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
