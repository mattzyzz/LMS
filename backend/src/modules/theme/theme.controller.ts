import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ThemeService } from './theme.service';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperadminAuthGuard } from '../superadmin/superadmin-auth.guard';

@ApiTags('theme')
@Controller('theme')
export class ThemeController {
  constructor(private readonly service: ThemeService) {}

  /** Public — no auth required */
  @Get('active')
  getActive() {
    return this.service.findActive();
  }

  /** Authenticated users can list themes (portal reads configs) */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /** All mutating endpoints require superadmin token */
  @UseGuards(SuperadminAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(@Body() dto: UpdateThemeDto) {
    return this.service.create(dto);
  }

  @UseGuards(SuperadminAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateThemeDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(SuperadminAuthGuard)
  @ApiBearerAuth()
  @Post(':id/activate')
  activate(@Param('id') id: string) {
    return this.service.activate(id);
  }

  @UseGuards(SuperadminAuthGuard)
  @ApiBearerAuth()
  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.service.duplicate(id);
  }

  @UseGuards(SuperadminAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
