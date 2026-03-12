import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EitherAuthGuard } from '../superadmin/either-auth.guard';
import { SuperadminAuthGuard } from '../superadmin/superadmin-auth.guard';
import { DictionariesService } from './dictionaries.service';
import { DictionaryType } from './dictionary-item.entity';
import {
  CreateDictionaryItemDto,
  UpdateDictionaryItemDto,
  ReorderDto,
  CreatePositionDto,
  UpdatePositionDto,
} from './dto/dictionary.dto';

@ApiTags('dictionaries')
@Controller('dictionaries')
export class DictionariesController {
  constructor(private readonly service: DictionariesService) {}

  // ── Positions (read: any authenticated user or superadmin; write: superadmin) ──

  @UseGuards(EitherAuthGuard)
  @ApiBearerAuth()
  @Get('positions')
  findPositions(@Query('all') all?: string) {
    return this.service.findAllPositions(all !== 'true');
  }

  @UseGuards(SuperadminAuthGuard)
  @ApiBearerAuth()
  @Post('positions')
  createPosition(@Body() dto: CreatePositionDto) {
    return this.service.createPosition(dto);
  }

  @UseGuards(SuperadminAuthGuard)
  @ApiBearerAuth()
  @Patch('positions/:id')
  updatePosition(@Param('id') id: string, @Body() dto: UpdatePositionDto) {
    return this.service.updatePosition(id, dto);
  }

  @UseGuards(SuperadminAuthGuard)
  @ApiBearerAuth()
  @Delete('positions/:id')
  deactivatePosition(@Param('id') id: string) {
    return this.service.deactivatePosition(id);
  }

  // ── Generic items (read: authenticated or superadmin; write: superadmin) ──

  @UseGuards(EitherAuthGuard)
  @ApiBearerAuth()
  @Get(':type')
  findByType(@Param('type') type: DictionaryType, @Query('all') all?: string) {
    return all === 'true'
      ? this.service.findAllByType(type)
      : this.service.findByType(type);
  }

  @UseGuards(SuperadminAuthGuard)
  @ApiBearerAuth()
  @Post(':type')
  createItem(@Param('type') type: DictionaryType, @Body() dto: CreateDictionaryItemDto) {
    return this.service.createItem(type, dto);
  }

  @UseGuards(SuperadminAuthGuard)
  @ApiBearerAuth()
  @Patch(':type/:id')
  updateItem(
    @Param('type') type: DictionaryType,
    @Param('id') id: string,
    @Body() dto: UpdateDictionaryItemDto,
  ) {
    return this.service.updateItem(type, id, dto);
  }

  @UseGuards(SuperadminAuthGuard)
  @ApiBearerAuth()
  @Delete(':type/:id')
  deactivateItem(@Param('type') type: DictionaryType, @Param('id') id: string) {
    return this.service.deactivateItem(type, id);
  }

  @UseGuards(SuperadminAuthGuard)
  @ApiBearerAuth()
  @Post(':type/reorder')
  reorder(@Param('type') type: DictionaryType, @Body() dto: ReorderDto) {
    return this.service.reorder(type, dto);
  }
}
