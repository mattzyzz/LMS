import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeProfile } from './employee-profile.entity';
import { Skill } from './skill.entity';
import { EmployeeSkill } from './employee-skill.entity';
import { Project } from './project.entity';
import { EmployeeProject } from './employee-project.entity';
import { ProfileSectionConfig } from './profile-section-config.entity';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { ProfileSectionConfigService } from './profile-section-config.service';
import { ProfileSectionConfigController } from './profile-section-config.controller';
import { SuperadminModule } from '../superadmin/superadmin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeProfile,
      Skill,
      EmployeeSkill,
      Project,
      EmployeeProject,
      ProfileSectionConfig,
    ]),
    SuperadminModule,
  ],
  controllers: [ProfilesController, ProfileSectionConfigController],
  providers: [ProfilesService, ProfileSectionConfigService],
  exports: [ProfilesService, ProfileSectionConfigService],
})
export class ProfilesModule {}
