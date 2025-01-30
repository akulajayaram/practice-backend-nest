import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from 'src/database/entities/refresh-token.entity';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from 'src/database/entities/user.entity';
import { EmailService } from '../email/email.service';
import { randomInt } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailerService: EmailService,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

  async logout(refreshToken: string, userId: string): Promise<void> {
    const token = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, user: { id: userId } },
    });

    if (!token) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    await this.refreshTokenRepository.delete({ id: token.id });
  }

  async register(name: string, email: string, password: string) {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new HttpException(
        'Email has been used before.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user data for activation token
    const newUser = { name, email, password: passwordHash };

    // Generate activation token
    const activationToken = this.jwtService.sign(newUser, {
      secret: this.config.get<string>('ACTIVATION_TOKEN_SECRET'),
      expiresIn: '1h', // Set an expiration time for the token
    });

    // Generate activation URL
    const clientUrl = this.config.get<string>('CLIENT_URL');
    const activationUrl = `${clientUrl}/activate/${activationToken}`;

    // Send activation email
    await this.mailerService.sendRegistrationUrl({
      to: email,
      context: { name, activationUrl },
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    // Generate OTP
    const otp = randomInt(100000, 999999).toString();

    // Save OTP to user entity (with expiration time)
    user.resetOtp = otp;
    user.resetOtpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await this.userRepository.save(user);

    // Send OTP via email
    await this.mailerService.sendResetPasswordOtp({
      to: email,
      context: { name: user.name, otp },
    });
  }

  async confirmOtp(email: string, otp: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || user.resetOtp !== otp || user.resetOtpExpiresAt < new Date()) {
      throw new HttpException('Invalid OTP or expired', HttpStatus.BAD_REQUEST);
    }

    user.resetOtp = null;
    user.resetOtpExpiresAt = null;
    await this.userRepository.save(user);

    const resetToken = this.jwtService.sign(
      { email },
      {
        secret: this.config.get('RESET_TOKEN_SECRET'),
        expiresIn: '15m',
      },
    );

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Verify and decode the token
    const decoded = this.jwtService.verify(token, {
      secret: this.config.get('RESET_TOKEN_SECRET'),
    });

    // Find the user by email
    const user = await this.userRepository.findOne({
      where: { email: decoded.email },
    });

    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    user.password = hashedPassword;
    await this.userRepository.save(user);
  }
}
