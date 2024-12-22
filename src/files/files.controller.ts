import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      limits: { fileSize: 1024 * 1024 },
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  ) //intercepta solicitudes
  //para recibir el dato. Debe tener el nombre del dato.
  uploadProductImage(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Make sure you upload an image');
    }
    return {
      fileName: file.originalname,
    };
  }
}
