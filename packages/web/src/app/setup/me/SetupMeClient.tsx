'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

const inputCls =
  'w-full px-3 py-2 rounded-lg bg-night-indigo border border-deep-periwinkle/30 text-cloud-white text-sm focus:border-fairy-gold/50 focus:outline-none';
const labelCls = 'block text-xs text-text-secondary mb-1';

export function SetupMeClient({ initialSetup, handle }: SetupMeClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setJoinMsg(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sensitivity */}
        <section>
          <h2 className="text-fairy-gold font-semibold mb-4">Sensitivity</h2>
          <div className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>DPI <span className="text-fairy-gold">*</span></label>
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
                <label className={labelCls}>General Sens <span className="text-fairy-gold">*</span></label>
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
                <label className={labelCls}>eDPI (auto)</label>
                <input
                  type="text"
                  readOnly
                  value={edpi ? edpi.toLocaleString() : ''}
                  className={`${inputCls} opacity-60 cursor-default`}
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
          </div>
        </section>

        {/* Scopes */}
        <section>
          <h2 className="text-fairy-gold font-semibold mb-4">Scope Sensitivities</h2>
          <div className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-5">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: '2x', value: scope2x, set: setScope2x },
                { label: '3x', value: scope3x, set: setScope3x },
                { label: '4x', value: scope4x, set: setScope4x },
                { label: '6x', value: scope6x, set: setScope6x },
                { label: '8x', value: scope8x, set: setScope8x },
                { label: '15x', value: scope15x, set: setScope15x },
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
          </div>
        </section>

        {/* Gear */}
        <section>
          <h2 className="text-fairy-gold font-semibold mb-4">Gear</h2>
          <div className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-5">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="col-span-2">
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
          </div>
        </section>

        {/* Notes */}
        <section>
          <h2 className="text-fairy-gold font-semibold mb-4">Notes</h2>
          <div className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-5">
            <textarea
              value={notes}
              placeholder="Additional notes..."
              maxLength={500}
              rows={4}
              onChange={e => setNotes(e.target.value)}
              className={`${inputCls} resize-none`}
            />
            <p className="text-xs text-text-muted mt-1 text-right">{notes.length} / 500</p>
          </div>
        </section>

        {/* Messages */}
        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
            {error}
          </p>
        )}
        {success && (
          <div className="space-y-3">
            <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
              {success}
            </p>
            {handle && (
              <Link
                href={`/u/${handle}`}
                className="inline-block px-4 py-2 rounded-lg bg-deep-periwinkle/50 text-mist-blue text-sm hover:bg-deep-periwinkle transition-colors"
              >
                View my card →
              </Link>
            )}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 rounded-lg bg-fairy-gold text-night-indigo font-semibold text-sm hover:bg-fairy-gold/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialSetup ? 'Update' : 'Register'}
        </button>
      </form>

      {/* Join Server */}
      <section className="border-t border-deep-periwinkle/30 pt-8">
        <h2 className="text-fairy-gold font-semibold mb-4">Join Server</h2>
        <div className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-5">
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
              className="px-4 py-2 rounded-lg bg-deep-periwinkle text-cloud-white text-sm hover:bg-deep-periwinkle/80 transition-colors"
            >
              Join
            </button>
          </div>
          {joinMsg && (
            <p className="text-sm text-text-secondary mt-2">{joinMsg}</p>
          )}
        </div>
      </section>
    </div>
  );
}
