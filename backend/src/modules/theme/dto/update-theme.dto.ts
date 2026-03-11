import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateThemeDto {
  @ApiPropertyOptional() @IsOptional() @IsString() brandName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() faviconUrl?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() colorPrimary?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorSecondary?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorAccent?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorBackground?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorSurface?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorBorder?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorTextPrimary?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorTextSecondary?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorTextMuted?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorSuccess?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorWarning?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorError?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorInfo?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() colorStatusAvailable?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorStatusBusy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorStatusOnLeave?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorStatusOffline?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() sidebarBg?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() headerBg?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() navActiveBg?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() navActiveColor?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() fontFamilyBase?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fontFamilyHeading?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(8) fontSizeBase?: number;
  @ApiPropertyOptional() @IsOptional() fontScaleRatio?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() fontWeightNormal?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() fontWeightMedium?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() fontWeightBold?: number;
  @ApiPropertyOptional() @IsOptional() lineHeightBase?: number;

  @ApiPropertyOptional() @IsOptional() @IsInt() spacingUnit?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() spacingCardPadding?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() spacingCardGap?: number;

  @ApiPropertyOptional() @IsOptional() @IsInt() borderRadiusSm?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() borderRadiusMd?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() borderRadiusLg?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() borderRadiusCard?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() borderRadiusFull?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() shadowSm?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() shadowMd?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() shadowLg?: string;
}
