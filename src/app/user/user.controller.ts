import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Auth } from 'src/core/decorators/auth.decorator';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth()
  @Post('create-user')
  @ApiBearerAuth()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Auth()
  @HttpCode(200)
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
