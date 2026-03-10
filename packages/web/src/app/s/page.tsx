export const dynamic = 'force-dynamic';

import { createSupabaseServer } from '@/lib/supabase/server';
import Link from 'next/link';

const BOT_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '';
const BOT_PERMISSIONS = '2147485696';
const BOT_INVITE_URL = BOT_CLIENT_ID
  ? `https://discord.com/api/oauth2/authorize?client_id=${BOT_CLIENT_ID}&permissions=${BOT_PERMISSIONS}&scope=bot%20applications.commands`
  : '';

interface ServerInfo {
  slug: string;
  name: string;
  icon_url: string | null;
}

function ServerCard({ server, isMine = false }: { server: ServerInfo; isMine?: boolean }) {
  return (
    <Link
      href={`/s/${server.slug}`}
      className={`flex items-center gap-4 p-4 bg-[rgba(26,26,58,0.6)] backdrop-blur-xl rounded-2xl border transition-all ${
        isMine
          ? 'border-fairy-gold/20 hover:border-fairy-gold/40 hover:shadow-[0_0_24px_rgba(244,210,122,0.15)]'
          : 'border-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(244,210,122,0.1)]'
      }`}
    >
      {server.icon_url ? (
        <img src={server.icon_url} alt="" className="w-10 h-10 rounded-full" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-sm font-bold">
          {server.name?.charAt(0) ?? '?'}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium truncate">{server.name}</div>
        <div className="text-white/30 text-xs">/s/{server.slug}</div>
      </div>
      {isMine && (
        <span className="text-[10px] font-semibold text-fairy-gold/70 bg-fairy-gold/10 border border-fairy-gold/20 rounded-full px-2 py-0.5 flex-shrink-0">
          MY
        </span>
      )}
    </Link>
  );
}

export default async function ServerIndexPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  // Get user's server memberships (ALL of them, not just the first)
  let myServerIds: string[] = [];
  let myServers: ServerInfo[] = [];

  if (user) {
    const { data: memberships } = await supabase
      .from('server_memberships')
      .select('server_id, servers(slug, name, icon_url)')
      .eq('profile_id', user.id);

    if (memberships && memberships.length > 0) {
      myServerIds = memberships.map((m) => m.server_id);
      myServers = memberships
        .map((m) => m.servers as unknown as ServerInfo | null)
        .filter((s): s is ServerInfo => s !== null);
    }
  }

  // Get all other registered servers (exclude user's servers)
  let otherServersQuery = supabase
    .from('servers')
    .select('slug, name, icon_url')
    .order('name');

  if (myServerIds.length > 0) {
    // Filter out user's own servers
    for (const id of myServerIds) {
      otherServersQuery = otherServersQuery.neq('id', id);
    }
  }

  const { data: otherServers } = myServerIds.length > 0
    ? await otherServersQuery
    : await supabase.from('servers').select('slug, name, icon_url').order('name');

  const hasMyServers = myServers.length > 0;
  const hasOtherServers = otherServers && otherServers.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-white mb-2">Server Statistics</h1>
      <p className="text-white/40 text-sm mb-8">
        {user
          ? hasMyServers
            ? '내가 속한 서버의 통계를 확인하세요.'
            : '서버 멤버십이 없습니다. 아래에서 서버를 선택하거나, 내 서버를 연동하세요.'
          : '디스코드 로그인 시 내 서버 목록이 표시됩니다.'}
      </p>

      {/* My Servers Section */}
      {hasMyServers && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-fairy-gold/30 to-transparent" />
            <h2 className="text-xs font-semibold text-fairy-gold/80 tracking-[0.2em] uppercase whitespace-nowrap">
              My Servers
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-fairy-gold/30 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myServers.map((server) => (
              <ServerCard key={server.slug} server={server} isMine />
            ))}
          </div>
        </div>
      )}

      {/* Other Servers Section */}
      {hasOtherServers && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-white/10" />
            <h2 className="text-xs font-medium text-white/30 tracking-[0.2em] uppercase">
              {hasMyServers ? 'Other Servers' : 'Servers'}
            </h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(otherServers as ServerInfo[]).map((server) => (
              <ServerCard key={server.slug} server={server} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasMyServers && !hasOtherServers && (
        <div className="text-center py-10 text-white/30 mb-10">
          아직 연동된 서버가 없습니다
        </div>
      )}

      {/* Server Integration Guide */}
      <div className="bg-[rgba(26,26,58,0.6)] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-fairy-gold/10 border border-fairy-gold/20 flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-fairy-gold">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white mb-1">내 디스코드 서버 연동하기</h2>
            <p className="text-white/40 text-sm mb-4">
              서버 관리자가 SENSI.GG 봇을 추가하면, 서버 멤버들의 감도 세팅을 한눈에 비교하고 통계를 확인할 수 있습니다.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-fairy-gold/20 text-fairy-gold text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  <p className="text-white/80 text-sm font-medium">봇 초대 링크로 서버에 추가</p>
                  <p className="text-white/30 text-xs">서버 관리자 권한이 필요합니다</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-fairy-gold/20 text-fairy-gold text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  <p className="text-white/80 text-sm font-medium">봇이 자동으로 서버를 등록</p>
                  <p className="text-white/30 text-xs">서버 이름, 아이콘이 SENSI.GG에 연동됩니다</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-fairy-gold/20 text-fairy-gold text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  <p className="text-white/80 text-sm font-medium">멤버들이 세팅을 등록하면 통계 자동 생성</p>
                  <p className="text-white/30 text-xs">DPI 분포, 감도 밴드, 인기 장비 등 서버 전용 통계 페이지</p>
                </div>
              </div>
            </div>

            {BOT_INVITE_URL ? (
              <a
                href={BOT_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-xl px-6 py-3 transition-all hover:shadow-[0_0_24px_rgba(88,101,242,0.3)]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/>
                </svg>
                SENSI.GG 봇 서버에 추가하기
              </a>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white/50 text-sm">봇 초대 링크가 설정되지 않았습니다.</p>
                <p className="text-white/30 text-xs mt-1">
                  관리자에게 문의하거나, <code className="text-fairy-gold/60">NEXT_PUBLIC_DISCORD_CLIENT_ID</code> 환경변수를 설정해주세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Commands Info */}
      <div className="mt-6 bg-[rgba(26,26,58,0.4)] rounded-2xl border border-white/5 p-5">
        <h3 className="text-sm font-semibold text-white/60 mb-3">봇 추가 후 사용 가능한 명령어</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <code className="text-fairy-gold/80 bg-fairy-gold/5 px-2 py-0.5 rounded">/setup me</code>
            <span className="text-white/30">내 세팅 보기</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-fairy-gold/80 bg-fairy-gold/5 px-2 py-0.5 rounded">/setup user</code>
            <span className="text-white/30">다른 유저 세팅 보기</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-fairy-gold/80 bg-fairy-gold/5 px-2 py-0.5 rounded">/setup share</code>
            <span className="text-white/30">채널에 세팅 공유</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-fairy-gold/80 bg-fairy-gold/5 px-2 py-0.5 rounded">/server-stats</code>
            <span className="text-white/30">서버 통계 링크</span>
          </div>
        </div>
      </div>
    </div>
  );
}
