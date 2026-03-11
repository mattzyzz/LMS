import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictionaryItem } from './dictionary-item.entity';
import { Position } from '../departments/position.entity';
import { DictionariesService } from './dictionaries.service';
import { DictionariesController } from './dictionaries.controller';
import { SuperadminModule } from '../superadmin/superadmin.module';

@Module({
  imports: [TypeOrmModule.forFeature([DictionaryItem, Position]), SuperadminModule],
  controllers: [DictionariesController],
  providers: [DictionariesService],
  exports: [DictionariesService],
})
export class DictionariesModule {}
