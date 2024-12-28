import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

//custome decorator para obtener al usuario
export const RawHeaders = createParamDecorator(
  //la data es lo que se envia al ser invocado el decorador
  (data: string, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const headers: string[] = req.rawHeaders;

    if (!headers)
      throw new InternalServerErrorException(
        'The request could not be handled by the server',
      );

    return headers;
  },
);
