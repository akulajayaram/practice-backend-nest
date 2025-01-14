import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { determineEnvFilePath } from 'src/core/utils/env.helper';
import { User } from 'src/database/entities/user.entity';
import { TypeOrmConfigService } from 'src/database/typeorm/typeorm.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: determineEnvFilePath(),
      load: [() => ({ environment: process.env.NODE_ENV || 'development' })],
    }),
  ],
  controllers: [],
  providers: [],
})
export class SeedModule {}
