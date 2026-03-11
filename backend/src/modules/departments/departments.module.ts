import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './department.entity';
import { Position } from './position.entity';
import { User } from '../users/user.entity';
import { EmployeeProfile } from '../profiles/employee-profile.entity';
import { OrgStructureConfig } from './org-structure-config.entity';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { OrgStructureConfigService } from './org-structure-config.service';
import { OrgStructureConfigController } from './org-structure-config.controller';
import { SuperadminModule } from '../superadmin/superadmin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Department, Position, User, EmployeeProfile, OrgStructureConfig]),
    SuperadminModule,
  ],
  controllers: [DepartmentsController, OrgStructureConfigController],
  providers: [DepartmentsService, OrgStructureConfigService],
  exports: [DepartmentsService, OrgStructureConfigService],
})
export class DepartmentsModule {}
