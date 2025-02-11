import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from 'src/database/entities/refresh-token.entity';
import { AuthController } from './auth.controller';
import { EmailModule } from '../email/email.module';
import { User } from 'src/database/entities/user.entity';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    TypeOrmModule.forFeature([RefreshToken, User]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService], // Inject ConfigService for use in factory function
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '3h' },
      }),
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
