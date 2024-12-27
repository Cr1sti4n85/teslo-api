import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

//custome decorator para obtener al usuario
export const GetUser = createParamDecorator(
  //la data es lo que se envia al ser invocado el decorador
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user)
      throw new InternalServerErrorException(
        'The request could not be handled by the server',
      );

    return user;
  },
);
