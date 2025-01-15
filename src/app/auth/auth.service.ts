import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from 'src/database/entities/refresh-token.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async login(user: any, device: string, ip: string) {
    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    const refreshTokenValue = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d', secret: this.config.get('REFRESH_TOKEN_SECRET') },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshToken = this.refreshTokenRepository.create({
      token: refreshTokenValue,
      expiresAt,
      user,
      device,
      ip,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshTokenValue,
    };
  }

  async refreshToken(refreshTokenValue: string, ip: string) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenValue },
      relations: ['user'],
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (refreshToken.ip !== ip) {
      throw new UnauthorizedException('IP mismatch');
    }

    const user = refreshToken.user;
    return this.login(user, refreshToken.device, ip);
  }

  async validateUser(username: string, password: string): Promise<any> {
    return this.userService.validateUser(username, password);
  }
}
