'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Lang = 'EN' | 'KR';

const translations = {
  EN: {
    nav: {
      gallery: 'Gallery',
      mySetup: 'My Setup',
      statistics: 'Statistics',
    },
    tabs: {
      sens: 'Sensitivity',
      gear: 'Gear',
      graphics: 'Graphics',
      tips: 'Tips',
      share: 'Share',
    },
    sens: {
      title: 'Sensitivity Details',
      dpi: 'DPI',
      generalSens: 'General Sens',
      edpi: 'eDPI',
      verticalMultiplier: 'Vertical Multiplier',
      adsSens: 'ADS Sens',
      scope2x: '2x Scope',
      scope3x: '3x Scope',
      scope4x: '4x Scope',
      scope6x: '6x Scope',
      scope8x: '8x Scope',
      scope15x: '15x Scope',
    },
    gear: {
      title: 'Gear Details',
      mouse: 'Mouse',
      keyboard: 'Keyboard',
      headset: 'Headset',
      mousepad: 'Mousepad',
      monitor: 'Monitor',
    },
    graphics: {
      title: 'Graphics Details',
      resolution: 'Resolution',
      aspectRatio: 'Aspect Ratio',
      refreshRate: 'Refresh Rate (Hz)',
      quality: 'Video Quality',
    },
    tips: {
      title: 'Tips',
      notes: 'Personal Notes & Routines',
    },
    share: {
      title: 'Share',
    },
    stats: {
      memberCount: 'Members',
      topDpi: 'Top DPI',
      avgEdpi: 'Avg eDPI',
      lastUpdate: 'Last Update',
      dpiDistribution: 'DPI Distribution',
      sensBands: 'Sensitivity Bands per DPI',
      edpiQuantiles: 'TOP DPI eDPI Quantiles',
      popularGear: 'Popular Gear (TOP 5)',
      mouse: 'Mouse',
      keyboard: 'Keyboard',
      headset: 'Headset',
      low: 'Low',
      mid: 'Mid',
      high: 'High',
      median: 'Median',
      noData: 'No data yet.',
      registerFirst: 'Be the first to register your setup!',
      registerCta: 'Register My Setup',
      noGearData: 'No data',
      members: 'members',
      users: 'users',
      basedOn: 'users in top DPI group',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      register: 'Register',
      update: 'Update',
      autoSaving: 'Auto-saving',
      saved: 'Saved',
      none: 'None',
    },
  },
  KR: {
    nav: {
      gallery: '갤러리',
      mySetup: '내 세팅',
      statistics: '통계',
    },
    tabs: {
      sens: '감도',
      gear: '장비',
      graphics: '그래픽',
      tips: '팁',
      share: '공유',
    },
    sens: {
      title: '감도 세부정보',
      dpi: 'DPI',
      generalSens: '기본 감도',
      edpi: 'eDPI',
      verticalMultiplier: '수직 배율',
      adsSens: 'ADS 감도',
      scope2x: '2배 스코프',
      scope3x: '3배 스코프',
      scope4x: '4배 스코프',
      scope6x: '6배 스코프',
      scope8x: '8배 스코프',
      scope15x: '15배 스코프',
    },
    gear: {
      title: '장비 세부정보',
      mouse: '마우스',
      keyboard: '키보드',
      headset: '헤드셋',
      mousepad: '마우스패드',
      monitor: '모니터',
    },
    graphics: {
      title: '그래픽 세부정보',
      resolution: '해상도',
      aspectRatio: '화면 비율',
      refreshRate: '주사율 (Hz)',
      quality: '비디오 품질',
    },
    tips: {
      title: '팁',
      notes: '개인 노트 & 루틴',
    },
    share: {
      title: '공유',
    },
    stats: {
      memberCount: '멤버 수',
      topDpi: 'TOP DPI',
      avgEdpi: '평균 eDPI',
      lastUpdate: '마지막 업데이트',
      dpiDistribution: 'DPI 인원 분포',
      sensBands: 'DPI별 감도 밴드',
      edpiQuantiles: 'TOP DPI 그룹 eDPI 분위수',
      popularGear: '인기 장비 (TOP 5)',
      mouse: '마우스',
      keyboard: '키보드',
      headset: '헤드셋',
      low: '낮음',
      mid: '중간',
      high: '높음',
      median: '중앙값',
      noData: '아직 등록된 세팅이 없습니다.',
      registerFirst: '첫 번째로 세팅을 등록해보세요!',
      registerCta: '내 세팅 등록',
      noGearData: '데이터 없음',
      members: '명',
      users: '명',
      basedOn: '명 (TOP DPI 그룹)',
    },
    common: {
      save: '저장',
      cancel: '취소',
      delete: '삭제',
      register: '등록',
      update: '수정',
      autoSaving: '자동 저장 중',
      saved: '저장됨',
      none: '없음',
    },
  },
} as const;

// Use a structural type that both EN and KR satisfy
export type Translations = {
  nav: { gallery: string; mySetup: string; statistics: string };
  tabs: { sens: string; gear: string; graphics: string; tips: string; share: string };
  sens: { title: string; dpi: string; generalSens: string; edpi: string; verticalMultiplier: string; adsSens: string; scope2x: string; scope3x: string; scope4x: string; scope6x: string; scope8x: string; scope15x: string };
  gear: { title: string; mouse: string; keyboard: string; headset: string; mousepad: string; monitor: string };
  graphics: { title: string; resolution: string; aspectRatio: string; refreshRate: string; quality: string };
  tips: { title: string; notes: string };
  share: { title: string };
  stats: { memberCount: string; topDpi: string; avgEdpi: string; lastUpdate: string; dpiDistribution: string; sensBands: string; edpiQuantiles: string; popularGear: string; mouse: string; keyboard: string; headset: string; low: string; mid: string; high: string; median: string; noData: string; registerFirst: string; registerCta: string; noGearData: string; members: string; users: string; basedOn: string };
  common: { save: string; cancel: string; delete: string; register: string; update: string; autoSaving: string; saved: string; none: string };
};

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LangContext = createContext<LangContextValue>({
  lang: 'EN',
  setLang: () => {},
  t: translations.EN,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('EN');

  useEffect(() => {
    const saved = localStorage.getItem('sensi_lang');
    if (saved === 'EN' || saved === 'KR') setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('sensi_lang', l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
