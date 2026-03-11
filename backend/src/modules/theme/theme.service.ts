import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { ThemeConfig } from './theme-config.entity';
import { UpdateThemeDto } from './dto/update-theme.dto';

@Injectable()
export class ThemeService implements OnModuleInit {
  constructor(
    @InjectRepository(ThemeConfig)
    private readonly repo: Repository<ThemeConfig>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      const seed: DeepPartial<ThemeConfig> = { isActive: true, brandName: 'Портал' };
      await this.repo.save(this.repo.create(seed));
    }
  }

  async findActive(): Promise<ThemeConfig> {
    const theme = await this.repo.findOne({ where: { isActive: true } });
    if (!theme) {
      const first = await this.repo.findOne({ order: { createdAt: 'ASC' } });
      if (!first) throw new NotFoundException('No theme config found');
      return first;
    }
    return theme;
  }

  async findAll(): Promise<ThemeConfig[]> {
    const rows = await this.repo.find({ order: { createdAt: 'DESC' } });
    return rows;
  }

  async findById(id: string): Promise<ThemeConfig> {
    const theme = await this.repo.findOne({ where: { id } });
    if (!theme) throw new NotFoundException('Theme not found');
    return theme;
  }

  async create(dto: UpdateThemeDto): Promise<ThemeConfig> {
    const theme = this.repo.create(dto as DeepPartial<ThemeConfig>);
    return this.repo.save(theme);
  }

  async update(id: string, dto: UpdateThemeDto): Promise<ThemeConfig> {
    await this.findById(id);
    await this.repo.update(id, dto as any);
    return this.findById(id);
  }

  async activate(id: string): Promise<ThemeConfig> {
    await this.findById(id);
    await this.repo.createQueryBuilder()
      .update(ThemeConfig)
      .set({ isActive: false })
      .execute();
    await this.repo.update(id, { isActive: true } as any);
    return this.findById(id);
  }

  async duplicate(id: string): Promise<ThemeConfig> {
    const original = await this.findById(id);
    const copy = this.repo.create({
      brandName: `${original.brandName} (копия)`,
      isActive: false,
      logoUrl: original.logoUrl,
      faviconUrl: original.faviconUrl,
      colorPrimary: original.colorPrimary,
      colorSecondary: original.colorSecondary,
      colorAccent: original.colorAccent,
      colorBackground: original.colorBackground,
      colorSurface: original.colorSurface,
      colorBorder: original.colorBorder,
      colorTextPrimary: original.colorTextPrimary,
      colorTextSecondary: original.colorTextSecondary,
      colorTextMuted: original.colorTextMuted,
      colorSuccess: original.colorSuccess,
      colorWarning: original.colorWarning,
      colorError: original.colorError,
      colorInfo: original.colorInfo,
      colorStatusAvailable: original.colorStatusAvailable,
      colorStatusBusy: original.colorStatusBusy,
      colorStatusOnLeave: original.colorStatusOnLeave,
      colorStatusOffline: original.colorStatusOffline,
      sidebarBg: original.sidebarBg,
      headerBg: original.headerBg,
      navActiveBg: original.navActiveBg,
      navActiveColor: original.navActiveColor,
      fontFamilyBase: original.fontFamilyBase,
      fontFamilyHeading: original.fontFamilyHeading,
      fontSizeBase: original.fontSizeBase,
      fontScaleRatio: original.fontScaleRatio,
      fontWeightNormal: original.fontWeightNormal,
      fontWeightMedium: original.fontWeightMedium,
      fontWeightBold: original.fontWeightBold,
      lineHeightBase: original.lineHeightBase,
      spacingUnit: original.spacingUnit,
      spacingCardPadding: original.spacingCardPadding,
      spacingCardGap: original.spacingCardGap,
      borderRadiusSm: original.borderRadiusSm,
      borderRadiusMd: original.borderRadiusMd,
      borderRadiusLg: original.borderRadiusLg,
      borderRadiusCard: original.borderRadiusCard,
      borderRadiusFull: original.borderRadiusFull,
      shadowSm: original.shadowSm,
      shadowMd: original.shadowMd,
      shadowLg: original.shadowLg,
    });
    return this.repo.save(copy);
  }

  async remove(id: string): Promise<void> {
    const theme = await this.findById(id);
    if (theme.isActive) throw new BadRequestException('Cannot delete active theme');
    await this.repo.remove(theme);
  }
}
