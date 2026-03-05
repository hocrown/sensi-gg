'use client';

import { SetupCard } from './SetupCard';

interface SetupGalleryProps {
  setups: any[];
  total: number;
  page: number;
  totalPages: number;
  tag?: string;
}

export function SetupGallery({ setups, total, page, totalPages, tag }: SetupGalleryProps) {
  if (setups.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">🎮</div>
        <h2 className="text-xl text-text-secondary mb-2">아직 등록된 세팅이 없습니다</h2>
        <p className="text-text-muted">Discord 봇이나 웹에서 첫 번째 세팅을 등록해보세요!</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-text-muted text-sm mb-6">총 {total}개의 세팅</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {setups.map(setup => (
          <SetupCard key={setup.id} setup={setup} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <a
              href={`/?page=${page - 1}${tag ? `&tag=${tag}` : ''}`}
              className="px-4 py-2 rounded-lg bg-deep-periwinkle/50 text-text-secondary hover:text-cloud-white hover:bg-deep-periwinkle transition-colors text-sm"
            >
              ◀ 이전
            </a>
          )}
          <span className="px-4 py-2 text-sm text-text-muted">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/?page=${page + 1}${tag ? `&tag=${tag}` : ''}`}
              className="px-4 py-2 rounded-lg bg-deep-periwinkle/50 text-text-secondary hover:text-cloud-white hover:bg-deep-periwinkle transition-colors text-sm"
            >
              다음 ▶
            </a>
          )}
        </div>
      )}
    </div>
  );
}
