import { create } from 'zustand';

export interface ThemeConfig {
  id: string;
  isActive: boolean;
  brandName: string;
  logoUrl: string | null;
  faviconUrl: string | null;

  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorBackground: string;
  colorSurface: string;
  colorBorder: string;
  colorTextPrimary: string;
  colorTextSecondary: string;
  colorTextMuted: string;
  colorSuccess: string;
  colorWarning: string;
  colorError: string;
  colorInfo: string;

  colorStatusAvailable: string;
  colorStatusBusy: string;
  colorStatusOnLeave: string;
  colorStatusOffline: string;

  sidebarBg: string;
  headerBg: string;
  navActiveBg: string;
  navActiveColor: string;

  fontFamilyBase: string;
  fontFamilyHeading: string | null;
  fontSizeBase: number;
  fontScaleRatio: number;
  fontWeightNormal: number;
  fontWeightMedium: number;
  fontWeightBold: number;
  lineHeightBase: number;

  spacingUnit: number;
  spacingCardPadding: number;
  spacingCardGap: number;

  borderRadiusSm: number;
  borderRadiusMd: number;
  borderRadiusLg: number;
  borderRadiusCard: number;
  borderRadiusFull: number;

  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
}

export const DEFAULT_THEME: ThemeConfig = {
  id: 'default',
  isActive: true,
  brandName: 'Портал',
  logoUrl: null,
  faviconUrl: null,

  colorPrimary: '#E52322',
  colorSecondary: '#1677ff',
  colorAccent: '#E52322',
  colorBackground: '#F5F5F5',
  colorSurface: '#FFFFFF',
  colorBorder: '#E8E8E8',
  colorTextPrimary: '#1A1A1A',
  colorTextSecondary: '#595959',
  colorTextMuted: '#8C8C8C',
  colorSuccess: '#10B981',
  colorWarning: '#F59E0B',
  colorError: '#EF4444',
  colorInfo: '#3B82F6',

  colorStatusAvailable: '#52c41a',
  colorStatusBusy: '#ff4d4f',
  colorStatusOnLeave: '#1677ff',
  colorStatusOffline: '#c8c8c8',

  sidebarBg: '#FFFFFF',
  headerBg: '#FFFFFF',
  navActiveBg: '#FFF0F0',
  navActiveColor: '#E52322',

  fontFamilyBase: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  fontFamilyHeading: null,
  fontSizeBase: 14,
  fontScaleRatio: 1.25,
  fontWeightNormal: 400,
  fontWeightMedium: 500,
  fontWeightBold: 600,
  lineHeightBase: 1.5,

  spacingUnit: 8,
  spacingCardPadding: 24,
  spacingCardGap: 16,

  borderRadiusSm: 4,
  borderRadiusMd: 8,
  borderRadiusLg: 16,
  borderRadiusCard: 12,
  borderRadiusFull: 9999,

  shadowSm: '0 1px 3px rgba(0,0,0,0.06)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.08)',
  shadowLg: '0 8px 24px rgba(0,0,0,0.12)',
};

interface ThemeStore {
  theme: ThemeConfig;
  loaded: boolean;
  setTheme: (theme: ThemeConfig) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: DEFAULT_THEME,
  loaded: false,
  setTheme: (theme) => set({ theme, loaded: true }),
}));
