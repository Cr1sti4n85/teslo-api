import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

//custom guard para validar rol del usuario
@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //el reflector permite recibir y obtener la metadata
    const validRoles: string[] = this.reflector.getAllAndOverride(META_ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) throw new BadRequestException('No valid user');

    for (const role of user.roles) {
      if (validRoles.includes(role)) return true;
    }
    // console.log(validRoles); //[admin, superuser]
    throw new ForbiddenException(
      `User must have a valid role: [${validRoles}]`,
    );
  }
}
