'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// @ts-ignore — shared is a JS package
import { FIELDS, getDefaultValues } from '@sensi-gg/shared';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FieldDescriptor {
  key: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'toggle' | 'textarea' | 'readonly';
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  multiselect?: boolean;
  placeholder?: string;
  note?: string;
  maxLength?: number;
}

type SectionValues = Record<string, null | string | boolean | string[] | number>;

interface SetupFormProps {
  mode?: 'create' | 'edit';
  setupId?: string;
  initialData?: {
    sens?: string;
    gear?: string;
    game?: string;
    tips?: string;
    guild_id?: string;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTIONS = [
  { key: 'sens', label: '감도', emoji: '🎯' },
  { key: 'gear', label: '장비', emoji: '⌨️' },
  { key: 'game', label: '그래픽', emoji: '🖥️' },
  { key: 'tips', label: '꿀팁', emoji: '💡' },
] as const;

type SectionKey = typeof SECTIONS[number]['key'];

// ─── Input class helpers ──────────────────────────────────────────────────────

const inputCls =
  'w-full px-3 py-2 rounded-lg bg-night-indigo border border-deep-periwinkle/30 text-cloud-white text-sm focus:border-fairy-gold/50 focus:outline-none';
const readonlyCls = `${inputCls} opacity-60 cursor-default`;
const selectCls = `${inputCls} bg-night-indigo`;
const labelCls = 'block text-xs text-text-secondary mb-1';

// ─── Section init ─────────────────────────────────────────────────────────────

function initSection(sectionKey: SectionKey, initialData?: SetupFormProps['initialData']): SectionValues {
  const defaults: SectionValues = getDefaultValues(sectionKey);
  const raw = initialData?.[sectionKey];
  if (!raw) return defaults;
  try {
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function hasLegacyText(sectionKey: SectionKey, initialData?: SetupFormProps['initialData']): boolean {
  const raw = initialData?.[sectionKey];
  if (!raw) return false;
  try {
    JSON.parse(raw);
    return false;
  } catch {
    return true;
  }
}

// ─── Serialization ────────────────────────────────────────────────────────────

function serializeSection(sectionKey: SectionKey, values: SectionValues): string | null {
  const fields: FieldDescriptor[] = FIELDS[sectionKey];
  const hasValue = fields.some(f => {
    if (f.type === 'readonly') return false;
    const v = values[f.key];
    if (Array.isArray(v)) return v.length > 0;
    return v !== null && v !== '' && v !== false && v !== undefined;
  });
  if (!hasValue) return null;

  const clean: SectionValues = {};
  for (const [k, v] of Object.entries(values)) {
    if (Array.isArray(v) ? v.length > 0 : v !== null && v !== '' && v !== undefined) {
      clean[k] = v;
    }
  }
  return JSON.stringify(clean);
}

// ─── eDPI computation ─────────────────────────────────────────────────────────

function computeEdpi(values: SectionValues): string {
  const dpi = Number(values['dpi']);
  const ingame = Number(values['ingame']);
  if (!dpi || !ingame) return '';
  return (dpi * ingame).toLocaleString();
}

// ─── FieldRenderer ────────────────────────────────────────────────────────────

interface FieldRendererProps {
  field: FieldDescriptor;
  value: null | string | boolean | string[] | number;
  sectionKey: SectionKey;
  sectionValues: SectionValues;
  onChange: (key: string, value: SectionValues[string]) => void;
}

function FieldRenderer({ field, value, sectionKey, sectionValues, onChange }: FieldRendererProps) {
  if (field.type === 'readonly') {
    const display = sectionKey === 'sens' && field.key === 'edpi'
      ? computeEdpi(sectionValues)
      : String(value ?? '');
    return (
      <div>
        <label className={labelCls}>{field.label}</label>
        <input type="text" readOnly value={display} className={readonlyCls} tabIndex={-1} />
        {field.note && <p className="text-xs text-text-muted mt-1">{field.note}</p>}
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <div>
        <label className={labelCls}>{field.label}{field.required && <span className="text-fairy-gold ml-0.5">*</span>}</label>
        <input
          type="number"
          value={value === null || value === undefined ? '' : String(value)}
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={field.placeholder}
          onChange={e => onChange(field.key, e.target.value === '' ? null : Number(e.target.value))}
          className={inputCls}
        />
      </div>
    );
  }

  if (field.type === 'text') {
    return (
      <div>
        <label className={labelCls}>{field.label}{field.required && <span className="text-fairy-gold ml-0.5">*</span>}</label>
        <input
          type="text"
          value={String(value ?? '')}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          onChange={e => onChange(field.key, e.target.value)}
          className={inputCls}
        />
      </div>
    );
  }

  if (field.type === 'select' && !field.multiselect) {
    return (
      <div>
        <label className={labelCls}>{field.label}{field.required && <span className="text-fairy-gold ml-0.5">*</span>}</label>
        <select
          value={String(value ?? '')}
          onChange={e => onChange(field.key, e.target.value)}
          className={selectCls}
        >
          <option value="">선택 안함</option>
          {field.options?.map(opt => (
            <option key={opt} value={opt}>{opt}{field.note ? ` ${field.note}` : ''}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === 'select' && field.multiselect) {
    const checked = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div className="col-span-2">
        <label className={labelCls}>{field.label}</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {field.options?.map(opt => (
            <label key={opt} className="flex items-center gap-1.5 text-sm text-cloud-white cursor-pointer">
              <input
                type="checkbox"
                checked={checked.includes(opt)}
                onChange={e => {
                  const next = e.target.checked
                    ? [...checked, opt]
                    : checked.filter(v => v !== opt);
                  onChange(field.key, next);
                }}
                className="accent-fairy-gold"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === 'toggle') {
    return (
      <div className="flex items-center justify-between col-span-2">
        <label className="text-xs text-text-secondary">{field.label}</label>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={e => onChange(field.key, e.target.checked)}
          className="accent-fairy-gold w-4 h-4"
        />
      </div>
    );
  }

  if (field.type === 'textarea') {
    const strVal = String(value ?? '');
    return (
      <div className="col-span-2">
        <label className={labelCls}>{field.label}{field.required && <span className="text-fairy-gold ml-0.5">*</span>}</label>
        <textarea
          value={strVal}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          rows={4}
          onChange={e => onChange(field.key, e.target.value)}
          className={`${inputCls} resize-none`}
        />
        {field.maxLength && (
          <p className="text-xs text-text-muted mt-1 text-right">{strVal.length} / {field.maxLength}</p>
        )}
      </div>
    );
  }

  return null;
}

// ─── SectionPanel ─────────────────────────────────────────────────────────────

interface SectionPanelProps {
  sectionKey: SectionKey;
  values: SectionValues;
  isLegacy: boolean;
  onChange: (key: string, value: SectionValues[string]) => void;
}

function SectionPanel({ sectionKey, values, isLegacy, onChange }: SectionPanelProps) {
  const fields: FieldDescriptor[] = FIELDS[sectionKey];

  return (
    <div className="rounded-xl border border-deep-periwinkle/50 bg-soft-navy/40 p-5">
      {isLegacy && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-fairy-gold/10 border border-fairy-gold/30 text-fairy-gold text-xs">
          기존 텍스트 데이터가 있습니다. 구조화된 폼으로 새로 입력해주세요.
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {fields.map(field => (
          <FieldRenderer
            key={field.key}
            field={field}
            value={values[field.key] ?? null}
            sectionKey={sectionKey}
            sectionValues={values}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}

// ─── SetupForm ────────────────────────────────────────────────────────────────

export function SetupForm({ mode = 'create', setupId, initialData }: SetupFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [guildId, setGuildId] = useState(
    initialData?.guild_id || process.env.NEXT_PUBLIC_DEFAULT_GUILD_ID || ''
  );

  const [sens, setSens] = useState<SectionValues>(() => initSection('sens', initialData));
  const [gear, setGear] = useState<SectionValues>(() => initSection('gear', initialData));
  const [game, setGame] = useState<SectionValues>(() => initSection('game', initialData));
  const [tips, setTips] = useState<SectionValues>(() => initSection('tips', initialData));

  const legacySens = hasLegacyText('sens', initialData);
  const legacyGear = hasLegacyText('gear', initialData);
  const legacyGame = hasLegacyText('game', initialData);
  const legacyTips = hasLegacyText('tips', initialData);

  const sectionState: Record<SectionKey, [SectionValues, React.Dispatch<React.SetStateAction<SectionValues>>]> = {
    sens: [sens, setSens],
    gear: [gear, setGear],
    game: [game, setGame],
    tips: [tips, setTips],
  };

  const makeSectionHandler = useCallback(
    (key: SectionKey) => (fieldKey: string, value: SectionValues[string]) => {
      sectionState[key][1](prev => {
        const next = { ...prev, [fieldKey]: value };
        // Keep eDPI in sync (stored as null, displayed live from compute)
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const legacyMap: Record<SectionKey, boolean> = {
    sens: legacySens, gear: legacyGear, game: legacyGame, tips: legacyTips,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const sensSer = serializeSection('sens', sens);
    const gearSer = serializeSection('gear', gear);
    const gameSer = serializeSection('game', game);
    const tipsSer = serializeSection('tips', tips);

    if (!sensSer && !gearSer && !gameSer && !tipsSer) {
      setError('최소 하나의 항목을 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      const url = mode === 'edit' ? `/api/setups/${setupId}` : '/api/setups';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sens: sensSer,
          gear: gearSer,
          game: gameSer,
          tips: tipsSer,
          guild_id: guildId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '요청에 실패했습니다.');
      }

      const data = await res.json();
      setSuccess(mode === 'edit' ? '세팅이 수정되었습니다!' : '세팅이 등록되었습니다!');

      if (mode === 'create') {
        setTimeout(() => router.push(`/setup/${data.id}`), 1000);
      } else {
        setTimeout(() => router.refresh(), 1000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!setupId || !confirm('정말로 세팅을 삭제하시겠습니까?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/setups/${setupId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      router.push('/');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const activeKey = SECTIONS[activeTab].key as SectionKey;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Guild ID */}
      {mode === 'create' && (
        <div>
          <label className="block text-sm text-text-secondary mb-1">서버 ID (Guild ID)</label>
          <input
            type="text"
            value={guildId}
            onChange={e => setGuildId(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-night-indigo border border-deep-periwinkle/50 text-cloud-white text-sm focus:border-fairy-gold/50 focus:outline-none"
            placeholder="Discord 서버 ID"
            required
          />
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-1 border-b border-deep-periwinkle/30 pb-0">
        {SECTIONS.map((section, i) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${
              activeTab === i
                ? 'bg-soft-navy text-fairy-gold border border-deep-periwinkle/50 border-b-soft-navy -mb-px'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {section.emoji} {section.label}
          </button>
        ))}
      </div>

      {/* Active Tab Panel */}
      <SectionPanel
        sectionKey={activeKey}
        values={sectionState[activeKey][0]}
        isLegacy={legacyMap[activeKey]}
        onChange={makeSectionHandler(activeKey)}
      />

      {/* Messages */}
      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
          {success}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 rounded-lg bg-fairy-gold text-night-indigo font-semibold text-sm hover:bg-fairy-gold/90 transition-colors disabled:opacity-50"
        >
          {loading ? '처리 중...' : mode === 'edit' ? '수정하기' : '등록하기'}
        </button>

        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-3 rounded-lg border border-red-500/50 text-red-400 text-sm hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            삭제
          </button>
        )}
      </div>
    </form>
  );
}
