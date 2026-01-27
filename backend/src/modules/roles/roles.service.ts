import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { RolePermission } from './role-permission.entity';
import { UserRole } from './user-role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async createRole(name: string, description?: string): Promise<Role> {
    const existing = await this.roleRepository.findOne({ where: { name } });
    if (existing) throw new ConflictException('Role already exists');
    const role = this.roleRepository.create({ name, description });
    return this.roleRepository.save(role);
  }

  async findAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({ relations: ['rolePermissions', 'rolePermissions.permission'] });
  }

  async findRoleById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async createPermission(name: string, resource: string, action: string, description?: string): Promise<Permission> {
    const permission = this.permissionRepository.create({ name, resource, action, description });
    return this.permissionRepository.save(permission);
  }

  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<RolePermission> {
    const rp = this.rolePermissionRepository.create({ roleId, permissionId });
    return this.rolePermissionRepository.save(rp);
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await this.rolePermissionRepository.delete({ roleId, permissionId });
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<UserRole> {
    const existing = await this.userRoleRepository.findOne({ where: { userId, roleId } });
    if (existing) throw new ConflictException('User already has this role');
    const ur = this.userRoleRepository.create({ userId, roleId });
    return this.userRoleRepository.save(ur);
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await this.userRoleRepository.delete({ userId, roleId });
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      where: { userId },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'],
    });
  }
}
