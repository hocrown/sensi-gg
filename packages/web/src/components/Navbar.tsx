'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LoginButton } from './LoginButton';

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Gallery' },
    { href: '/my', label: 'My Setup' },
  ];

  return (
    <nav className="border-b border-deep-periwinkle/50 bg-night-indigo/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-fairy-gold font-bold text-xl tracking-tight">
            SENSI.GG
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === link.href
                    ? 'bg-deep-periwinkle text-cloud-white'
                    : 'text-text-secondary hover:text-cloud-white hover:bg-deep-periwinkle/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <LoginButton />
      </div>
    </nav>
  );
}
