export const dynamic = 'force-dynamic';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-7xl font-bold text-white/10 mb-4">404</div>
      <p className="text-white/50 text-lg mb-6">Page not found</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-mist-blue hover:border-mist-blue/30 transition-all text-sm"
      >
        &larr; Back to Gallery
      </Link>
    </div>
  );
}
