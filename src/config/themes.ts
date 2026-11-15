import { NetworkConfig, Station } from '@/types';

export interface SystemThemeConfig {
  id: NetworkConfig['systemTheme'];
  label: string;
  color: string;
  sidebarBg: string;
  footerBg: string;
  badgeClass: string;
}

export const SYSTEM_THEMES: Record<NetworkConfig['systemTheme'], SystemThemeConfig> = {
  'navy-pro': {
    id: 'navy-pro',
    label: 'Bleu Marine Pro',
    color: '#0A1D37',
    sidebarBg: 'bg-[#0A1D37]',
    footerBg: 'bg-[#0A1D37]',
    badgeClass: 'bg-blue-900/50 text-blue-200 border-blue-700/50',
  },
  'slate-dark': {
    id: 'slate-dark',
    label: 'Nuit Ardoise',
    color: '#0F172A',
    sidebarBg: 'bg-slate-900',
    footerBg: 'bg-slate-900',
    badgeClass: 'bg-slate-800 text-slate-200 border-slate-700',
  },
  'emerald-clean': {
    id: 'emerald-clean',
    label: 'Émeraude Énergie',
    color: '#064E3B',
    sidebarBg: 'bg-emerald-950',
    footerBg: 'bg-emerald-950',
    badgeClass: 'bg-emerald-900/50 text-emerald-200 border-emerald-700/50',
  },
  'royal-blue': {
    id: 'royal-blue',
    label: 'Saphir Royal',
    color: '#1E3A8A',
    sidebarBg: 'bg-blue-950',
    footerBg: 'bg-blue-950',
    badgeClass: 'bg-blue-900/60 text-blue-100 border-blue-600/50',
  },
};

export interface LayoutDensityClasses {
  sectionGap: string;
  gridGap: string;
  cardPadding: string;
  productGridCols: string;
}

export const LAYOUT_DENSITY: Record<NonNullable<Station['layoutStyle']>, LayoutDensityClasses> = {
  standard: {
    sectionGap: 'space-y-6',
    gridGap: 'gap-4',
    cardPadding: 'p-4',
    productGridCols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  },
  compact: {
    sectionGap: 'space-y-4',
    gridGap: 'gap-3',
    cardPadding: 'p-3',
    productGridCols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  },
  dense: {
    sectionGap: 'space-y-3',
    gridGap: 'gap-2.5',
    cardPadding: 'p-2.5',
    productGridCols: 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-5',
  },
};

export function getSystemTheme(themeId?: NetworkConfig['systemTheme']): SystemThemeConfig {
  return SYSTEM_THEMES[themeId ?? 'navy-pro'] ?? SYSTEM_THEMES['navy-pro'];
}

export function getLayoutDensity(style?: Station['layoutStyle']): LayoutDensityClasses {
  return LAYOUT_DENSITY[style ?? 'standard'] ?? LAYOUT_DENSITY.standard;
}
