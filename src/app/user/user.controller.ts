import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Auth } from 'src/core/decorators/auth.decorator';
import { RoleIds } from 'src/core/utils/enum';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth(RoleIds.Admin, RoleIds.User)
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }
}
