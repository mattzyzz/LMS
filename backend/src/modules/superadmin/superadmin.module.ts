import { Module } from '@nestjs/common';
import { SuperadminController } from './superadmin.controller';
import { SuperadminAuthGuard } from './superadmin-auth.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SuperadminController],
  providers: [SuperadminAuthGuard],
  exports: [SuperadminAuthGuard, AuthModule],
})
export class SuperadminModule {}
