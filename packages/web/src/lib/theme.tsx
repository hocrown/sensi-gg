'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type ThemeMode = 'sensi' | 'figma';

/** Color tokens for each theme */
export interface ThemeColors {
  /** Page background */
  bg: string;
  /** Glass card background */
  cardBg: string;
  /** Glass card border */
  cardBorder: string;
  /** Primary accent (gold) */
  accent: string;
  /** Secondary accent */
  secondary: string;
  /** Tertiary (purple) */
  tertiary: string;
  /** Chart bar 1 (DPI) */
  chartBar1: string;
  /** Chart bar 2 (eDPI / sensitivity) */
  chartBar2: string;
  /** Low sensitivity band */
  bandLow: string;
  /** Mid sensitivity band */
  bandMid: string;
  /** High sensitivity band */
  bandHigh: string;
  /** Primary text */
  textPrimary: string;
  /** Secondary text */
  textSecondary: string;
  /** Muted text */
  textMuted: string;
  /** Axis / grid stroke */
  axisStroke: string;
  /** Tooltip bg */
  tooltipBg: string;
  /** Rank colors [1st, 2nd, 3rd, 4th, 5th] */
  rankBg: string[];
  rankText: string[];
  rankBorder: string[];
  /** Section title accent colors */
  sectionAccents: {
    dpi: string;
    sens: string;
    edpi: string;
    gear: string;
  };
  /** Stat card icon colors */
  iconColors: {
    members: string;
    topDpi: string;
    avgEdpi: string;
    lastUpdate: string;
  };
  /** CTA button */
  ctaBg: string;
  ctaText: string;
}

const sensiTheme: ThemeColors = {
  bg: '#2B2F5A',
  cardBg: 'rgba(26,26,58,0.6)',
  cardBorder: 'rgba(255,255,255,0.1)',
  accent: '#F4D27A',
  secondary: '#AFC6FF',
  tertiary: '#9B7FD4',
  chartBar1: '#F4D27A',
  chartBar2: '#AFC6FF',
  bandLow: '#AFC6FF',
  bandMid: '#F4D27A',
  bandHigh: '#f87171',
  textPrimary: '#EAF0FF',
  textSecondary: '#B8C2E6',
  textMuted: '#8E98C7',
  axisStroke: '#8E98C7',
  tooltipBg: '#1A1A3A',
  rankBg: [
    'rgba(244,210,122,0.2)',
    'rgba(251,146,60,0.2)',
    'rgba(168,85,247,0.2)',
    'rgba(255,255,255,0.1)',
    'rgba(255,255,255,0.1)',
  ],
  rankText: ['#F4D27A', '#fb923c', '#a855f7', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.5)'],
  rankBorder: [
    'rgba(244,210,122,0.3)',
    'rgba(251,146,60,0.3)',
    'rgba(168,85,247,0.3)',
    'rgba(255,255,255,0.1)',
    'rgba(255,255,255,0.1)',
  ],
  sectionAccents: {
    dpi: '#F4D27A',
    sens: '#AFC6FF',
    edpi: '#9B7FD4',
    gear: '#fb923c',
  },
  iconColors: {
    members: '#AFC6FF',
    topDpi: '#F4D27A',
    avgEdpi: '#a78bfa',
    lastUpdate: '#B8C2E6',
  },
  ctaBg: '#F4D27A',
  ctaText: '#2B2F5A',
};

const figmaTheme: ThemeColors = {
  bg: '#1A1A3A',
  cardBg: 'rgba(26,26,58,0.6)',
  cardBorder: 'rgba(255,255,255,0.1)',
  accent: '#FFD700',
  secondary: '#A5B4FC',
  tertiary: '#9370DB',
  chartBar1: '#FFD700',
  chartBar2: '#9370DB',
  bandLow: '#A5B4FC',
  bandMid: '#FFD700',
  bandHigh: '#f87171',
  textPrimary: '#FFFFFF',
  textSecondary: '#A5B4FC',
  textMuted: '#A5B4FC',
  axisStroke: '#A5B4FC',
  tooltipBg: '#1A1A3A',
  rankBg: [
    'rgba(255,215,0,0.2)',
    'rgba(255,165,0,0.2)',
    'rgba(147,112,219,0.2)',
    'rgba(75,139,59,0.2)',
    'rgba(255,255,255,0.1)',
  ],
  rankText: ['#FFD700', '#FFA500', '#9370DB', '#4B8B3B', 'rgba(255,255,255,0.5)'],
  rankBorder: [
    'rgba(255,215,0,0.3)',
    'rgba(255,165,0,0.3)',
    'rgba(147,112,219,0.3)',
    'rgba(75,139,59,0.3)',
    'rgba(255,255,255,0.1)',
  ],
  sectionAccents: {
    dpi: '#FFD700',
    sens: '#FFA500',
    edpi: '#9370DB',
    gear: '#4B8B3B',
  },
  iconColors: {
    members: '#FFD700',
    topDpi: '#FFA500',
    avgEdpi: '#9370DB',
    lastUpdate: '#A5B4FC',
  },
  ctaBg: '#FFD700',
  ctaText: '#1A1A3A',
};

export const themes: Record<ThemeMode, ThemeColors> = {
  sensi: sensiTheme,
  figma: figmaTheme,
};

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'sensi',
  setMode: () => {},
  colors: sensiTheme,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('sensi');

  useEffect(() => {
    const saved = localStorage.getItem('sensi_theme') as ThemeMode | null;
    if (saved === 'sensi' || saved === 'figma') setModeState(saved);
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem('sensi_theme', m);
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, colors: themes[mode] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
