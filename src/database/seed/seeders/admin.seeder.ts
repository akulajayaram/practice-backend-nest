import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { SeederInterface } from '../seeder.interface';
import { hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../entities/role.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class AdminSeeder implements SeederInterface {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    private readonly config: ConfigService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}
  async seed() {
    const data: Partial<User> = await this.generateData();
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      const result = await transactionalEntityManager.upsert(User, data, {
        conflictPaths: ['email'],
      });
      const adminUser = await transactionalEntityManager
        .getRepository(User)
        .findOne({
          where: {
            id: result.raw[0]?.id,
          },
        });
      if (adminUser) {
        adminUser.roles = data.roles;
        await transactionalEntityManager.save(adminUser);
      }
    });
  }

  private async generateData(): Promise<Partial<User>> {
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!password) {
      throw new Error(
        'Admin password is not configured in the environment variables',
      );
    }

    const hashedPassword = await hash(password, 10);
    const adminRoles = await this.rolesRepository.find();
    return {
      name: 'Admin', // Add default name
      username: 'admin', // Add default username
      email: this.config.get<string>('ADMIN_EMAIL'),
      password: hashedPassword,
      roles: adminRoles,
    };
  }
}
