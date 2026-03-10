'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LoginButton } from './LoginButton';

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Gallery' },
    { href: '/setup/me', label: 'My Setup' },
  ];

  return (
    <nav className="relative bg-[rgba(13,13,32,0.7)] backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-fairy-gold font-bold text-xl tracking-tight drop-shadow-[0_0_8px_rgba(244,210,122,0.3)]">
            SENSI.GG
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  pathname === link.href
                    ? 'bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-cloud-white'
                    : 'text-white/50 hover:text-mist-blue px-4 py-1.5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <LoginButton />
      </div>
      {/* Subtle shine line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fairy-gold/20 to-transparent" />
    </nav>
  );
}
