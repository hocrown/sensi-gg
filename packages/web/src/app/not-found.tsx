export const dynamic = 'force-dynamic';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">404</div>
      <h2 className="text-xl text-text-secondary mb-4">페이지를 찾을 수 없습니다</h2>
      <Link
        href="/"
        className="text-fairy-gold hover:text-fairy-gold/80 transition-colors"
      >
        ← 홈으로 돌아가기
      </Link>
    </div>
  );
}
