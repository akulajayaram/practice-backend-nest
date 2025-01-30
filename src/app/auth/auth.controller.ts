import {
  Controller,
  Post,
  Body,
  Request,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ConfirmOtpDto } from './dto/confirm-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { SetMessage } from 'src/core/decorators/set-message.decorator';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @ApiBody({
    description: 'User login credentials',
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'john_doe' },
        password: { type: 'string', example: 'password123' },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'JWT_ACCESS_TOKEN',
        refresh_token: 'JWT_REFRESH_TOKEN',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() body: { username: string; password: string },
    @Request() req,
  ) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const device = req.headers['user-agent'] || 'Unknown Device';
    const ip = req.ip || req.connection.remoteAddress;

    return this.authService.login(user, device, ip);
  }

  @Post('refresh-token')
  @HttpCode(200)
  @ApiBody({
    description: 'Refresh token payload',
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'REFRESH_TOKEN' },
      },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed',
    schema: {
      example: {
        access_token: 'NEW_ACCESS_TOKEN',
        refresh_token: 'NEW_REFRESH_TOKEN',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(@Body() body: { refreshToken: string }, @Request() req) {
    return this.authService.refreshToken(body.refreshToken, req.ip);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Logout successful.',
    schema: {
      example: {
        message: 'Logout successful',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or invalid token.',
  })
  async logout(@Body() body: { refreshToken: string }, @Request() req) {
    if (!body.refreshToken) {
      throw new HttpException(
        'Refresh token is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    await this.authService.logout(body.refreshToken, userId);
    return { message: 'Logout successful' };
  }

  @Post('register')
  @HttpCode(200)
  @SetMessage('Email activation link has been sent to your email')
  async register(
    @Body() body: { name: string; email: string; password: string },
  ) {
    await this.authService.register(body.name, body.email, body.password);
  }

  // Forgot Password
  @Post('forgot-password')
  @HttpCode(200)
  @ApiBody({
    description: 'Forgot password request',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'john.doe@example.com' },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset OTP sent',
    schema: {
      example: {
        message: 'OTP sent to email',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid email or user not found' })
  @SetMessage('OTP sent to email')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  // Confirm OTP (for password reset)
  @Post('confirm-otp')
  @HttpCode(200)
  @ApiBody({
    description: 'OTP confirmation',
    schema: {
      type: 'object',
      properties: {
        otp: { type: 'string', example: '123456' },
        email: { type: 'string', example: 'john.doe@example.com' },
      },
      required: ['otp', 'email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OTP confirmed successfully',
    schema: {
      example: {
        message: 'OTP confirmed, proceed with password reset',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid OTP or expired' })
  @SetMessage('OTP confirmed, proceed with password reset')
  async confirmOtp(@Body() confirmOtpDto: ConfirmOtpDto) {
    const resetToken = await this.authService.confirmOtp(
      confirmOtpDto.email,
      confirmOtpDto.otp,
    );

    return {
      resetToken,
    };
  }

  @Post('activate')
  @SetMessage('Account has been activated successfully')
  async activateAccount(@Body() body: { token: string }) {
    const { token } = body;

    if (!token) {
      throw new HttpException(
        'Invalid account activation token.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const secret = this.configService.get<string>('ACTIVATION_TOKEN_SECRET');
    const decoded = this.jwtService.verify(token, { secret });

    // Check if the user already exists
    const existingUser = await this.usersService.findByEmail(decoded.email);
    if (existingUser) {
      throw new HttpException(
        'Email has been used before.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create a new user record
    await this.usersService.create({
      email: decoded.email,
      password: decoded.password,
      name: decoded.name,
      username: decoded.username,
    });
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiBody({
    description: 'Reset password',
    schema: {
      type: 'object',
      properties: {
        resetToken: { type: 'string', example: 'jwt_reset_token_here' },
        newPassword: { type: 'string', example: 'SecureP@ssword123' },
      },
      required: ['resetToken', 'newPassword'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      example: {
        message: 'Password reset successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token or password criteria not met',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(
      resetPasswordDto.resetToken,
      resetPasswordDto.newPassword,
    );

    return {
      message: 'Password reset successfully',
    };
  }
}
