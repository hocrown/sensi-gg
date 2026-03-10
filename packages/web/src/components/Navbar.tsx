'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, LayoutGrid, Settings, BarChart3 } from 'lucide-react';
import { LoginButton } from './LoginButton';
import { useLang } from '@/lib/i18n';

export function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t.nav.gallery, Icon: LayoutGrid },
    { href: '/setup/me', label: t.nav.mySetup, Icon: Settings },
    { href: '/s', label: t.nav.statistics, Icon: BarChart3 },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* Top Nav — visible on lg+ */}
      <nav className="relative bg-[rgba(13,13,32,0.7)] backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Hamburger — visible only on small screens */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <Link href="/" className="text-fairy-gold font-bold text-xl tracking-tight drop-shadow-[0_0_8px_rgba(244,210,122,0.3)]">
              SENSI.GG
            </Link>

            {/* Top nav links — hidden on small screens */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm transition-colors ${
                    isActive(href)
                      ? 'bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-cloud-white'
                      : 'text-white/50 hover:text-white/80 px-4 py-1.5'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <LoginButton />
        </div>
        {/* Subtle shine line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fairy-gold/20 to-transparent" />
      </nav>

      {/* Sidebar Drawer — small screens only */}
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[60]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-[rgba(13,13,32,0.95)] backdrop-blur-xl border-r border-white/10 z-[70] flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="text-fairy-gold font-bold text-xl tracking-tight drop-shadow-[0_0_8px_rgba(244,210,122,0.3)]"
          >
            SENSI.GG
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(href)
                  ? 'bg-[rgba(42,43,85,0.8)] text-[#FFF085] shadow-[0_0_15px_rgba(255,215,0,0.1)]'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/90'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Language toggle at bottom */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-center gap-1 bg-black/40 border border-white/10 rounded-full px-1 py-1">
            <button
              onClick={() => setLang('EN')}
              className={`rounded-full px-4 py-1 text-xs font-semibold transition-colors ${
                lang === 'EN'
                  ? 'bg-[rgba(253,199,0,0.3)] border border-[rgba(253,199,0,0.5)] text-[#fff085]'
                  : 'border border-transparent text-white/50 hover:text-white/70'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('KR')}
              className={`rounded-full px-4 py-1 text-xs font-semibold transition-colors ${
                lang === 'KR'
                  ? 'bg-[rgba(253,199,0,0.3)] border border-[rgba(253,199,0,0.5)] text-[#fff085]'
                  : 'border border-transparent text-white/50 hover:text-white/70'
              }`}
            >
              한글
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
