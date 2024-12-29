import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  //para usar el Auth aca hay que expotar el modulo JwtStrategy y PassportModule
  // desde el AuthModule e importar en este modulo el AuthModule
  @Auth(ValidRoles.admin)
  executeSeed() {
    return this.seedService.runSeed();
  }
}
