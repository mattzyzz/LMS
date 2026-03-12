import { Module } from '@nestjs/common';
import { SuperadminController } from './superadmin.controller';
import { SuperadminAuthGuard } from './superadmin-auth.guard';
import { EitherAuthGuard } from './either-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SuperadminController],
  providers: [SuperadminAuthGuard, EitherAuthGuard, JwtAuthGuard],
  exports: [SuperadminAuthGuard, EitherAuthGuard, AuthModule],
})
export class SuperadminModule {}
