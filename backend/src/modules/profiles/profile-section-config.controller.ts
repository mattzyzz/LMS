import { Controller, Get, Patch, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperadminAuthGuard } from '../superadmin/superadmin-auth.guard';
import { ProfileSectionConfigService } from './profile-section-config.service';
import { ProfileSectionConfig } from './profile-section-config.entity';

@ApiTags('profile-config')
@Controller('profile-config')
export class ProfileSectionConfigController {
  constructor(private readonly service: ProfileSectionConfigService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(SuperadminAuthGuard)
  @ApiBearerAuth()
  @Patch(':sectionKey')
  update(@Param('sectionKey') key: string, @Body() dto: Partial<ProfileSectionConfig>) {
    return this.service.update(key, dto);
  }

  @UseGuards(SuperadminAuthGuard)
  @ApiBearerAuth()
  @Post('reorder')
  reorder(@Body() body: { items: { sectionKey: string; sortOrder: number }[] }) {
    return this.service.reorder(body.items);
  }
}
