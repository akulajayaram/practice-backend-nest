import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { UserService } from 'src/app/user/user.service';
import { errorMessages } from '../utils/errors';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const bearerToken = request.headers.authorization.split(' ')[1];
      const payload = await this.jwtService.verifyAsync(bearerToken, {
        secret: this.config.get('JWT_SECRET'),
      });
      request.user = await this.userService.findById(payload.id, {
        roles: true,
      });
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError)
        throw new UnauthorizedException(errorMessages.auth.expiredToken);
      throw new UnauthorizedException(errorMessages.auth.invlidToken);
    }
  }
}
