const SECTION_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  sens: { label: '감도', emoji: '🎯', color: 'bg-fairy-gold/20 text-fairy-gold border-fairy-gold/30' },
  gear: { label: '장비', emoji: '⌨️', color: 'bg-mist-blue/20 text-mist-blue border-mist-blue/30' },
  game: { label: '그래픽', emoji: '🖥️', color: 'bg-deep-periwinkle/20 text-cloud-white border-deep-periwinkle/30' },
  tips: { label: '꿀팁', emoji: '💡', color: 'bg-fairy-gold/20 text-fairy-gold border-fairy-gold/30' },
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
