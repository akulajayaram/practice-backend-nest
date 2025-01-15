import {
  Controller,
  Post,
  Body,
  Request,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Auth } from 'src/core/decorators/auth.decorator';

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
  constructor(private readonly authService: AuthService) {}

  @Post('login')
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

  @Auth()
  @Post('profile')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: 'UUID',
        username: 'john_doe',
        email: 'john.doe@example.com',
        roles: [{ id: 1, name: 'Admin' }],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    return req.user;
  }
}
