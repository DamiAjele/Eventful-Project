// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    Logger.log('========================');
    Logger.log('USER:', user);
    Logger.log('ROLE FROM USER:', user?.role);
    Logger.log('REQUIRED ROLES:', requiredRoles);
    Logger.log('MATCH:', requiredRoles?.includes(user?.role));
    Logger.log('========================');

    return requiredRoles?.includes(user?.role);
  }
}
