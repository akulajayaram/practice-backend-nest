import { Injectable } from '@nestjs/common';
import { AdminSeeder } from './seeders/admin.seeder';
import { RolesSeeder } from './seeders/role.seeder';
import { PermissionsSeeder } from './seeders/permission.seeder';

@Injectable()
export class SeederService {
  constructor(
    private readonly adminSeeder: AdminSeeder,
    private readonly rolesSeeder: RolesSeeder,
    private readonly permissionsSeeder: PermissionsSeeder,
  ) {}

  async runSeeders() {
    // Call your seeder methods here
    await this.rolesSeeder.seed();
    await this.permissionsSeeder.seed();
    await this.adminSeeder.seed();
  }
}
