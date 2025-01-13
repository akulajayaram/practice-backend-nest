import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';
import { AuthGuard } from '../guards/auth.guard';

export function Auth(...roleIds: number[]) {
  return applyDecorators(
    SetMetadata('roleIds', roleIds),
    UseGuards(AuthGuard, RolesGuard),
  );
}
