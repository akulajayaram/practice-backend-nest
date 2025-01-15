import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { AdminSeeder } from './seeders/admin.seeder';
import { RolesSeeder } from './seeders/role.seeder';
import { SeederService } from './seeder.service';
import { TypeOrmConfigService } from '../typeorm/typeorm.service';
import { determineEnvFilePath } from 'src/core/utils/env.helper';
import { PermissionsSeeder } from './seeders/permission.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: determineEnvFilePath(),
      load: [() => ({ environment: process.env.NODE_ENV || 'development' })],
    }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    TypeOrmModule.forFeature([User, Role, Permission]),
  ],
  providers: [SeederService, RolesSeeder, AdminSeeder, PermissionsSeeder],
  exports: [SeederService],
})
export class SeederModule {}
