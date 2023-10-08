import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { SetMetadata } from '@nestjs/common'

export const Roles = (...roles: string[]) => SetMetadata('roles', roles)

export enum Role {
  Admin = 'admin',
  User = 'user',
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = Role.Admin
    const roles = this.reflector.get<Role[]>('roles', context.getHandler())

    if (!roles) {
      return true // Действие не помечено аннотацией @Roles, разрешено выполнение
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    return !(!user || user.role !== requiredRole)
  }
}
