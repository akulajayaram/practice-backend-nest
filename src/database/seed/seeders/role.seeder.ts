import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeederInterface } from '../seeder.interface';
import { Role } from 'src/database/entities/role.entity';
import { Roles, RoleIds } from 'src/core/utils/enum';

@Injectable()
export class RolesSeeder implements SeederInterface {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async seed() {
    const data: Partial<Role>[] = this.generateData();
    await this.rolesRepository.upsert(data, {
      conflictPaths: ['id'],
    });
  }

  private generateData(): Partial<Role>[] {
    return Object.keys(Roles).map((key) => ({
      id: RoleIds[key],
      name: Roles[key],
    }));
  }
}
