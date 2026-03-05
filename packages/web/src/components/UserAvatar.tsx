import Image from 'next/image';

interface UserAvatarProps {
  src?: string | null;
  username: string;
  size?: number;
  className?: string;
}

export function UserAvatar({ src, username, size = 40, className = '' }: UserAvatarProps) {
  if (!src) {
    return (
      <div
        className={`rounded-full bg-deep-periwinkle flex items-center justify-center text-fairy-gold font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {username.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={username}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  );
}
