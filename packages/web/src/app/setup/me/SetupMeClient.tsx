'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Crosshair,
  Mouse,
  Monitor,
  Lightbulb,
  Share2,
  Info,
  Copy,
  Check,
} from 'lucide-react';

interface SetupData {
  id: string;
  dpi: number;
  general_sens: number;
  vertical_multiplier?: number | null;
  ads_sens?: number | null;
  scope_2x?: number | null;
  scope_3x?: number | null;
  scope_4x?: number | null;
  scope_6x?: number | null;
  scope_8x?: number | null;
  scope_15x?: number | null;
  mouse?: string | null;
  keyboard?: string | null;
  headset?: string | null;
  mousepad?: string | null;
  monitor?: string | null;
  notes?: string | null;
}

interface SetupMeClientProps {
  initialSetup: SetupData | null;
  handle: string | null;
}

type Tab = 'sens' | 'gear' | 'graphics' | 'tips' | 'share';

const TABS: { id: Tab; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'sens',     label: 'Sensitivity', Icon: Crosshair  },
  { id: 'gear',     label: 'Gear',        Icon: Mouse      },
  { id: 'graphics', label: 'Graphics',    Icon: Monitor    },
  { id: 'tips',     label: 'Tips',        Icon: Lightbulb  },
  { id: 'share',    label: 'Share',       Icon: Share2     },
];

// ── Shared field styles ──────────────────────────────────────────────────────
const inputCls =
  'w-full px-4 py-3 rounded-[14px] bg-[rgba(13,13,32,0.5)] border border-white/10 text-cloud-white text-base focus:border-fairy-gold/40 focus:outline-none focus:ring-1 focus:ring-fairy-gold/20 transition-colors placeholder:text-text-muted';

const labelCls = 'block text-sm font-medium text-mist-blue mb-1.5 pl-1';

function InfoLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className={labelCls}>
      <span className="inline-flex items-center gap-1">
        {children}
        <Info size={12} className="text-text-muted opacity-60" />
      </span>
    </label>
  );
}

// ── Card wrapper ─────────────────────────────────────────────────────────────
function SectionCard({
  title,
  Icon,
  children,
  action,
}: {
  title: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-3xl border border-white/10 p-6 md:p-8"
      style={{
        background: 'rgba(26,26,58,0.4)',
        boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-3 text-xl font-semibold text-cloud-white">
          <Icon size={20} className="text-fairy-gold" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export function SetupMeClient({ initialSetup, handle }: SetupMeClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('sens');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  // Sensitivity
  const [dpi, setDpi] = useState(initialSetup?.dpi ?? 800);
  const [generalSens, setGeneralSens] = useState(initialSetup?.general_sens ?? 42);
  const [verticalMultiplier, setVerticalMultiplier] = useState<string>(
    initialSetup?.vertical_multiplier?.toString() ?? ''
  );
  const [adsSens, setAdsSens] = useState<string>(
    initialSetup?.ads_sens?.toString() ?? ''
  );

  // Scopes
  const [scope2x, setScope2x] = useState<string>(initialSetup?.scope_2x?.toString() ?? '');
  const [scope3x, setScope3x] = useState<string>(initialSetup?.scope_3x?.toString() ?? '');
  const [scope4x, setScope4x] = useState<string>(initialSetup?.scope_4x?.toString() ?? '');
  const [scope6x, setScope6x] = useState<string>(initialSetup?.scope_6x?.toString() ?? '');
  const [scope8x, setScope8x] = useState<string>(initialSetup?.scope_8x?.toString() ?? '');
  const [scope15x, setScope15x] = useState<string>(initialSetup?.scope_15x?.toString() ?? '');

  // Gear
  const [mouse, setMouse] = useState(initialSetup?.mouse ?? '');
  const [keyboard, setKeyboard] = useState(initialSetup?.keyboard ?? '');
  const [headset, setHeadset] = useState(initialSetup?.headset ?? '');
  const [mousepad, setMousepad] = useState(initialSetup?.mousepad ?? '');
  const [monitor, setMonitor] = useState(initialSetup?.monitor ?? '');

  // Notes
  const [notes, setNotes] = useState(initialSetup?.notes ?? '');

  // Join code
  const [joinCode, setJoinCode] = useState('');
  const [joinMsg, setJoinMsg] = useState('');

  const edpi = dpi && generalSens ? Math.round(dpi * generalSens) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const parseNum = (v: string) => {
      const n = parseFloat(v);
      return isNaN(n) ? null : n;
    };

    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dpi,
          general_sens: generalSens,
          vertical_multiplier: parseNum(verticalMultiplier),
          ads_sens: parseNum(adsSens),
          scope_2x: parseNum(scope2x),
          scope_3x: parseNum(scope3x),
          scope_4x: parseNum(scope4x),
          scope_6x: parseNum(scope6x),
          scope_8x: parseNum(scope8x),
          scope_15x: parseNum(scope15x),
          mouse: mouse || null,
          keyboard: keyboard || null,
          headset: headset || null,
          mousepad: mousepad || null,
          monitor: monitor || null,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSuccess(initialSetup ? 'Updated!' : 'Registered!');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoinMsg('');

    try {
      const res = await fetch('/api/server/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ join_code: joinCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJoinMsg(`${data.server.name} - ${data.message}`);
      setJoinCode('');
    } catch (err: unknown) {
      setJoinMsg(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleCopyLink = async () => {
    const url = handle ? `${window.location.origin}/u/${handle}` : window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardUrl = handle ? `/u/${handle}` : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Tab Navigation ─────────────────────────────────────────────── */}
      <div className="flex justify-center gap-3 flex-wrap">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className="flex flex-col items-center justify-center gap-2 w-24 h-24 rounded-2xl border transition-all duration-200"
              style={
                isActive
                  ? {
                      background: 'rgba(244,210,122,0.12)',
                      borderColor: 'rgba(244,210,122,0.5)',
                      boxShadow: '0 0 20px rgba(244,210,122,0.25)',
                      color: '#fef9c2',
                    }
                  : {
                      background: 'rgba(26,26,58,0.6)',
                      borderColor: 'rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.7)',
                    }
              }
            >
              <Icon size={24} />
              <span className="text-xs font-medium leading-tight text-center">{label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Sensitivity Tab ─────────────────────────────────────────────── */}
      {activeTab === 'sens' && (
        <SectionCard
          title="Sensitivity Details"
          Icon={Crosshair}
          action={
            <button
              type="button"
              disabled
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted border border-white/10 bg-white/5 cursor-not-allowed opacity-50"
            >
              Auto-fill via Image
            </button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <InfoLabel>DPI</InfoLabel>
              <input
                type="number"
                value={dpi}
                min={100}
                max={6400}
                step={50}
                onChange={e => setDpi(Number(e.target.value))}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>General Sens</label>
              <input
                type="number"
                value={generalSens}
                min={1}
                max={100}
                step={1}
                onChange={e => setGeneralSens(Number(e.target.value))}
                className={inputCls}
                required
              />
            </div>
            <div>
              <InfoLabel>eDPI</InfoLabel>
              <input
                type="text"
                readOnly
                value={edpi ? edpi.toLocaleString() : ''}
                className={`${inputCls} opacity-70 cursor-default`}
                tabIndex={-1}
              />
            </div>
            <div>
              <label className={labelCls}>Vertical Multiplier</label>
              <input
                type="number"
                value={verticalMultiplier}
                min={0.5}
                max={2.0}
                step={0.1}
                placeholder="1.0"
                onChange={e => setVerticalMultiplier(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>ADS Sens</label>
              <input
                type="number"
                value={adsSens}
                min={1}
                max={100}
                step={1}
                placeholder="35"
                onChange={e => setAdsSens(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Gear Tab ────────────────────────────────────────────────────── */}
      {activeTab === 'gear' && (
        <SectionCard title="Gear Setup" Icon={Mouse}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Mouse</label>
              <input
                type="text"
                value={mouse}
                placeholder="Logitech G Pro X Superlight"
                onChange={e => setMouse(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Keyboard</label>
              <input
                type="text"
                value={keyboard}
                placeholder="Wooting 60HE"
                onChange={e => setKeyboard(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Headset</label>
              <input
                type="text"
                value={headset}
                placeholder="HyperX Cloud Alpha"
                onChange={e => setHeadset(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Mousepad</label>
              <input
                type="text"
                value={mousepad}
                placeholder="Artisan Hien XL"
                onChange={e => setMousepad(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Monitor</label>
              <input
                type="text"
                value={monitor}
                placeholder="BenQ XL2546K"
                onChange={e => setMonitor(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Graphics / Scopes Tab ───────────────────────────────────────── */}
      {activeTab === 'graphics' && (
        <SectionCard title="Scope Sensitivities" Icon={Monitor}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {[
              { label: '2x Scope',  value: scope2x,  set: setScope2x  },
              { label: '3x Scope',  value: scope3x,  set: setScope3x  },
              { label: '4x Scope',  value: scope4x,  set: setScope4x  },
              { label: '6x Scope',  value: scope6x,  set: setScope6x  },
              { label: '8x Scope',  value: scope8x,  set: setScope8x  },
              { label: '15x Scope', value: scope15x, set: setScope15x },
            ].map(s => (
              <div key={s.label}>
                <label className={labelCls}>{s.label}</label>
                <input
                  type="number"
                  value={s.value}
                  min={1}
                  max={100}
                  step={1}
                  onChange={e => s.set(e.target.value)}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── Tips / Notes Tab ────────────────────────────────────────────── */}
      {activeTab === 'tips' && (
        <SectionCard title="Tips & Notes" Icon={Lightbulb}>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              value={notes}
              placeholder="Share your tips, crosshair settings, or any helpful notes..."
              maxLength={500}
              rows={6}
              onChange={e => setNotes(e.target.value)}
              className={`${inputCls} resize-none`}
            />
            <p className="text-xs text-text-muted mt-2 text-right">
              {notes.length} / 500
            </p>
          </div>
        </SectionCard>
      )}

      {/* ── Share Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'share' && (
        <SectionCard title="Share Your Setup" Icon={Share2}>
          <div className="space-y-6">
            {cardUrl ? (
              <>
                <div>
                  <label className={labelCls}>Your Setup Card URL</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/u/${handle}`}
                      className={`${inputCls} opacity-70 cursor-default flex-1`}
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 px-4 py-3 rounded-[14px] border border-fairy-gold/30 bg-fairy-gold/10 text-fairy-gold text-sm font-medium hover:bg-fairy-gold/20 transition-colors whitespace-nowrap"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>
                <Link
                  href={cardUrl}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-[14px] bg-deep-periwinkle/50 text-mist-blue text-sm font-medium hover:bg-deep-periwinkle/70 transition-colors border border-white/10"
                >
                  View my setup card
                </Link>
              </>
            ) : (
              <p className="text-text-muted text-sm">
                Save your setup first to get a shareable card URL.
              </p>
            )}

            {/* Join Server */}
            <div className="border-t border-white/10 pt-6">
              <label className={labelCls}>Join a Server</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  placeholder="Enter join code"
                  className={`flex-1 ${inputCls}`}
                />
                <button
                  type="button"
                  onClick={handleJoin}
                  className="px-5 py-3 rounded-[14px] bg-deep-periwinkle text-cloud-white text-sm font-medium hover:bg-deep-periwinkle/80 transition-colors border border-white/10 whitespace-nowrap"
                >
                  Join
                </button>
              </div>
              {joinMsg && (
                <p className="text-sm text-text-secondary mt-2">{joinMsg}</p>
              )}
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Status messages ─────────────────────────────────────────────── */}
      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}
      {success && (
        <div className="space-y-3">
          <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
            {success}
          </p>
          {handle && (
            <Link
              href={`/u/${handle}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-deep-periwinkle/50 text-mist-blue text-sm hover:bg-deep-periwinkle transition-colors border border-white/10"
            >
              View my card
            </Link>
          )}
        </div>
      )}

      {/* ── Save button (hidden on Share tab) ───────────────────────────── */}
      {activeTab !== 'share' && (
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50"
          style={{
            background: loading
              ? 'rgba(244,210,122,0.5)'
              : 'linear-gradient(135deg, #F4D27A 0%, #e6bb5a 100%)',
            color: '#1a1a3a',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(244,210,122,0.25)',
          }}
        >
          {loading ? 'Saving...' : initialSetup ? 'Update Setup' : 'Register Setup'}
        </button>
      )}
    </form>
  );
}
