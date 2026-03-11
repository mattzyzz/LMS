import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThemeConfig } from './theme-config.entity';
import { ThemeService } from './theme.service';
import { ThemeController } from './theme.controller';
import { SuperadminModule } from '../superadmin/superadmin.module';

@Module({
  imports: [TypeOrmModule.forFeature([ThemeConfig]), SuperadminModule],
  controllers: [ThemeController],
  providers: [ThemeService],
  exports: [ThemeService],
})
export class ThemeModule {}
