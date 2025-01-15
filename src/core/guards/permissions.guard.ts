import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { errorMessages } from '../utils/errors';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const userPermissions = request.user.roles
      .flatMap((role: { permissions: any[] }) =>
        role.permissions.map((perm: { name: any }) => perm.name),
      )
      .filter(
        (value: any, index: any, self: string | any[]) =>
          self.indexOf(value) === index,
      ); // Unique permissions

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new UnauthorizedException(errorMessages.auth.notAllowed);
    }

    return true;
  }
}
