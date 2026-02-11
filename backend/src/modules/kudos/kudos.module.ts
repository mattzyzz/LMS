import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kudos } from './kudos.entity';
import { Reaction } from './reaction.entity';
import { LeaderboardSnapshot } from './leaderboard-snapshot.entity';
import { KudosService } from './kudos.service';
import { KudosController } from './kudos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Kudos, Reaction, LeaderboardSnapshot])],
  controllers: [KudosController],
  providers: [KudosService],
  exports: [KudosService],
})
export class KudosModule {}
