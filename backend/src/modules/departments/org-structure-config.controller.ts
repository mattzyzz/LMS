import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperadminAuthGuard } from '../superadmin/superadmin-auth.guard';
import { OrgStructureConfigService } from './org-structure-config.service';
import { OrgStructureConfig } from './org-structure-config.entity';

@ApiTags('org-structure-config')
@Controller('org-structure-config')
export class OrgStructureConfigController {
  constructor(private readonly service: OrgStructureConfigService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  getDefault() {
    return this.service.getDefault();
  }

  @UseGuards(SuperadminAuthGuard)
  @ApiBearerAuth()
  @Patch()
  update(@Body() dto: Partial<OrgStructureConfig>) {
    return this.service.update(dto);
  }

  @UseGuards(SuperadminAuthGuard)
  @ApiBearerAuth()
  @Post('reset')
  reset() {
    return this.service.reset();
  }
}
