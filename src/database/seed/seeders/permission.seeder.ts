import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeederInterface } from '../seeder.interface';
import { Permission } from 'src/database/entities/permission.entity';
import { Role } from 'src/database/entities/role.entity';

@Injectable()
export class PermissionsSeeder implements SeederInterface {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async seed() {
    // Define permissions
    const permissionsData = [
      'create_user',
      'edit_user',
      'delete_user',
      'view_users',
      'edit_role',
      'delete_role',
      'create_role',
      'view_roles',
      'view_profile',
      'edit_profile',
    ];

    // Seed permissions
    const permissions = await Promise.all(
      permissionsData.map(async (permissionName) => {
        const permission = await this.permissionsRepository.findOne({
          where: { name: permissionName },
        });

        if (!permission) {
          return this.permissionsRepository.save({ name: permissionName });
        }

        return permission;
      }),
    );

    // Assign permissions to roles
    const adminPermissions = permissions; // Admin gets all permissions
    const userPermissions = permissions.filter((permission) =>
      ['view_profile', 'edit_profile'].includes(permission.name),
    );

    const adminRole = await this.rolesRepository.findOne({
      where: { name: 'Admin' },
      relations: ['permissions'],
    });
    const userRole = await this.rolesRepository.findOne({
      where: { name: 'User' },
      relations: ['permissions'],
    });

    if (adminRole) {
      adminRole.permissions = adminPermissions;
      await this.rolesRepository.save(adminRole);
    }

    if (userRole) {
      userRole.permissions = userPermissions;
      await this.rolesRepository.save(userRole);
    }
  }
}
