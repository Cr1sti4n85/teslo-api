import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Headers,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/get-rawHeaders.decorator';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard()) //sirve para aplicar autenticacion y autorizacion
  testingPrivateRoute(
    @RawHeaders() rawHeaders: string[],
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @Headers() headers: IncomingHttpHeaders,
  ) {
    return {
      ok: true,
      message: 'succesful',
      user,
      userEmail,
      rawHeaders,
      headers,
    };
  }

  //este get va a necesitar ciertos roles del usuario
  @Get('private2')
  @SetMetadata('roles', ['admin', 'superuser']) //esta metadata se le pasa al UserRoleGuard
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      message: 'succesful',
      user,
    };
  }
}
