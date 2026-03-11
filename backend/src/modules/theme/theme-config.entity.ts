import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('theme_configs')
export class ThemeConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'varchar', length: 200, default: 'Портал' })
  brandName: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  logoUrl: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  faviconUrl: string | null;

  // ── Colors ──────────────────────────────────────────────────
  @Column({ type: 'varchar', length: 20, default: '#E52322' })
  colorPrimary: string;

  @Column({ type: 'varchar', length: 20, default: '#1677ff' })
  colorSecondary: string;

  @Column({ type: 'varchar', length: 20, default: '#E52322' })
  colorAccent: string;

  @Column({ type: 'varchar', length: 20, default: '#F5F5F5' })
  colorBackground: string;

  @Column({ type: 'varchar', length: 20, default: '#FFFFFF' })
  colorSurface: string;

  @Column({ type: 'varchar', length: 20, default: '#E8E8E8' })
  colorBorder: string;

  @Column({ type: 'varchar', length: 20, default: '#1A1A1A' })
  colorTextPrimary: string;

  @Column({ type: 'varchar', length: 20, default: '#595959' })
  colorTextSecondary: string;

  @Column({ type: 'varchar', length: 20, default: '#8C8C8C' })
  colorTextMuted: string;

  @Column({ type: 'varchar', length: 20, default: '#10B981' })
  colorSuccess: string;

  @Column({ type: 'varchar', length: 20, default: '#F59E0B' })
  colorWarning: string;

  @Column({ type: 'varchar', length: 20, default: '#EF4444' })
  colorError: string;

  @Column({ type: 'varchar', length: 20, default: '#3B82F6' })
  colorInfo: string;

  // ── Status dot colors ────────────────────────────────────────
  @Column({ type: 'varchar', length: 20, default: '#52c41a' })
  colorStatusAvailable: string;

  @Column({ type: 'varchar', length: 20, default: '#ff4d4f' })
  colorStatusBusy: string;

  @Column({ type: 'varchar', length: 20, default: '#1677ff' })
  colorStatusOnLeave: string;

  @Column({ type: 'varchar', length: 20, default: '#c8c8c8' })
  colorStatusOffline: string;

  // ── Sidebar / header ─────────────────────────────────────────
  @Column({ type: 'varchar', length: 20, default: '#FFFFFF' })
  sidebarBg: string;

  @Column({ type: 'varchar', length: 20, default: '#FFFFFF' })
  headerBg: string;

  @Column({ type: 'varchar', length: 20, default: '#FFF0F0' })
  navActiveBg: string;

  @Column({ type: 'varchar', length: 20, default: '#E52322' })
  navActiveColor: string;

  // ── Typography ───────────────────────────────────────────────
  @Column({ type: 'varchar', length: 200, default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' })
  fontFamilyBase: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  fontFamilyHeading: string | null;

  @Column({ type: 'int', default: 14 })
  fontSizeBase: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 1.25 })
  fontScaleRatio: number;

  @Column({ type: 'int', default: 400 })
  fontWeightNormal: number;

  @Column({ type: 'int', default: 500 })
  fontWeightMedium: number;

  @Column({ type: 'int', default: 600 })
  fontWeightBold: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 1.5 })
  lineHeightBase: number;

  // ── Spacing ──────────────────────────────────────────────────
  @Column({ type: 'int', default: 8 })
  spacingUnit: number;

  @Column({ type: 'int', default: 24 })
  spacingCardPadding: number;

  @Column({ type: 'int', default: 16 })
  spacingCardGap: number;

  // ── Border radius ────────────────────────────────────────────
  @Column({ type: 'int', default: 4 })
  borderRadiusSm: number;

  @Column({ type: 'int', default: 8 })
  borderRadiusMd: number;

  @Column({ type: 'int', default: 16 })
  borderRadiusLg: number;

  @Column({ type: 'int', default: 12 })
  borderRadiusCard: number;

  @Column({ type: 'int', default: 9999 })
  borderRadiusFull: number;

  // ── Shadows ──────────────────────────────────────────────────
  @Column({ type: 'varchar', length: 200, default: '0 1px 3px rgba(0,0,0,0.06)' })
  shadowSm: string;

  @Column({ type: 'varchar', length: 200, default: '0 4px 12px rgba(0,0,0,0.08)' })
  shadowMd: string;

  @Column({ type: 'varchar', length: 200, default: '0 8px 24px rgba(0,0,0,0.12)' })
  shadowLg: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
