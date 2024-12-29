import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';

//custome decorator para obtener al usuario
export const GetUser = createParamDecorator(
  //la data es lo que se envia al ser invocado el decorador
  (data: string, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;
    // console.log('user', user);

    if (!user)
      throw new InternalServerErrorException(
        'The request could not be handled by the server',
      );

    return !data ? user : user[data];
  },
);
