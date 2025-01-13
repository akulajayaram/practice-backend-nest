import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configuration } from 'src/core/config';
import { User } from 'src/database/entities/user.entity';
import { TypeOrmConfigService } from 'src/database/typeorm/typeorm.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
  ],
  controllers: [],
  providers: [],
})
export class SeedModule {}
