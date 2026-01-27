import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeProfile } from './employee-profile.entity';
import { Skill } from './skill.entity';
import { EmployeeSkill } from './employee-skill.entity';
import { Project } from './project.entity';
import { EmployeeProject } from './employee-project.entity';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeProfile,
      Skill,
      EmployeeSkill,
      Project,
      EmployeeProject,
    ]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
