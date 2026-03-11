'use client';

import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { useThemeStore, DEFAULT_THEME, ThemeConfig } from '@/stores/theme.store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

function applyThemeCssVars(theme: ThemeConfig) {
  const root = document.documentElement;
  const set = (key: string, val: string) => root.style.setProperty(key, val);

  set('--color-primary', theme.colorPrimary);
  set('--color-secondary', theme.colorSecondary);
  set('--color-accent', theme.colorAccent);
  set('--color-bg', theme.colorBackground);
  set('--color-surface', theme.colorSurface);
  set('--color-border', theme.colorBorder);
  set('--color-text-primary', theme.colorTextPrimary);
  set('--color-text-secondary', theme.colorTextSecondary);
  set('--color-text-muted', theme.colorTextMuted);
  set('--color-success', theme.colorSuccess);
  set('--color-warning', theme.colorWarning);
  set('--color-error', theme.colorError);
  set('--color-info', theme.colorInfo);

  set('--color-status-available', theme.colorStatusAvailable);
  set('--color-status-busy', theme.colorStatusBusy);
  set('--color-status-on-leave', theme.colorStatusOnLeave);
  set('--color-status-offline', theme.colorStatusOffline);

  set('--sidebar-bg', theme.sidebarBg);
  set('--header-bg', theme.headerBg);
  set('--nav-active-bg', theme.navActiveBg);
  set('--nav-active-color', theme.navActiveColor);

  set('--font-family-base', theme.fontFamilyBase);
  if (theme.fontFamilyHeading) set('--font-family-heading', theme.fontFamilyHeading);
  set('--font-size-base', `${theme.fontSizeBase}px`);
  set('--font-weight-normal', String(theme.fontWeightNormal));
  set('--font-weight-medium', String(theme.fontWeightMedium));
  set('--font-weight-bold', String(theme.fontWeightBold));
  set('--line-height-base', String(theme.lineHeightBase));

  set('--spacing-unit', `${theme.spacingUnit}px`);
  set('--spacing-card-padding', `${theme.spacingCardPadding}px`);
  set('--spacing-card-gap', `${theme.spacingCardGap}px`);

  set('--border-radius-sm', `${theme.borderRadiusSm}px`);
  set('--border-radius-md', `${theme.borderRadiusMd}px`);
  set('--border-radius-lg', `${theme.borderRadiusLg}px`);
  set('--border-radius-card', `${theme.borderRadiusCard}px`);
  set('--border-radius-full', `${theme.borderRadiusFull}px`);

  set('--shadow-sm', theme.shadowSm);
  set('--shadow-md', theme.shadowMd);
  set('--shadow-lg', theme.shadowLg);

  // Legacy aliases for backward compatibility
  set('--color-primary-accent', theme.colorPrimary);
  set('--color-bg-primary', theme.colorBackground);
  set('--color-bg-card', theme.colorSurface);
  set('--border-radius-card-legacy', `${theme.borderRadiusCard}px`);
  set('--spacing-card', `${theme.spacingCardPadding}px`);
  set('--gap-card', `${theme.spacingCardGap}px`);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Apply defaults immediately to avoid flash
    applyThemeCssVars(DEFAULT_THEME);

    // Fetch active theme from backend
    fetch(`${API_BASE}/theme/active`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) {
          setTheme(data);
          applyThemeCssVars(data);
        }
      })
      .catch(() => {
        // Use defaults on error
        setTheme(DEFAULT_THEME);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: theme.colorPrimary,
          colorSuccess: theme.colorSuccess,
          colorWarning: theme.colorWarning,
          colorError: theme.colorError,
          colorInfo: theme.colorInfo,
          borderRadius: theme.borderRadiusMd,
          fontFamily: theme.fontFamilyBase,
          fontSize: theme.fontSizeBase,
          colorBgContainer: theme.colorSurface,
          colorBgLayout: theme.colorBackground,
          colorBorder: theme.colorBorder,
          colorBorderSecondary: theme.colorBorder,
        },
        components: {
          Button: {
            borderRadius: theme.borderRadiusMd,
            controlHeight: 40,
            paddingContentHorizontal: 20,
          },
          Card: {
            borderRadiusLG: theme.borderRadiusCard,
            paddingLG: theme.spacingCardPadding,
          },
          Input: {
            borderRadius: theme.borderRadiusMd,
            controlHeight: 40,
          },
          Select: {
            borderRadius: theme.borderRadiusMd,
            controlHeight: 40,
          },
          Table: {
            borderRadius: theme.borderRadiusLg,
            headerBg: '#FAFAFA',
          },
          Tag: {
            borderRadiusSM: theme.borderRadiusFull,
          },
          Menu: {
            itemBorderRadius: theme.borderRadiusMd,
            itemMarginInline: 8,
            itemPaddingInline: 16,
          },
          Modal: {
            borderRadiusLG: theme.borderRadiusLg,
          },
          Drawer: {
            borderRadiusLG: theme.borderRadiusLg,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
