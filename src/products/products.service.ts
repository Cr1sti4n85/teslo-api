import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  //logger para ver errores en consola
  private readonly logger = new Logger('ProductService');
  //uso del patron repositorio para instanciar la entity Product
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  async create(createProductDto: CreateProductDto) {
    try {
      //esta validacion se hizo en la entity con beforeInsert()
      // if (!createProductDto.slug) {
      //   createProductDto.slug = createProductDto.title
      //     .toLowerCase()
      //     .replaceAll(' ', '_')
      //     .replaceAll("'", '');
      // } else {
      //   createProductDto.slug = createProductDto.slug
      //     .toLowerCase()
      //     .replaceAll(' ', '_')
      //     .replaceAll("'", '');
      // }

      //create in memory
      const product = this.productRepository.create(createProductDto);

      //save to db
      await this.productRepository.save(product);
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
    });

    return products;
  }

  async findOne(val: string) {
    let product: Product;

    if (!product && isUUID(val)) {
      product = await this.productRepository.findOneBy({ id: val });
    } else {
      //el query builder va a buscar por title o slug. Convertira el title
      //para no generar problemas con el apostrofe o espacios en blanco
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where(`UPPER(title) =:title or slug =:slug`, {
          title: val.toUpperCase(),
          slug: val.toLowerCase(),
        })
        .getOne();
    }

    // if (!isUUID(val)) {
    //   product = await this.productRepository.findOne({ where: { slug: val } });
    // }

    if (!product)
      throw new NotFoundException(
        `Product with id, title or slug ${val} not found`,
      );

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const { affected } = await this.productRepository.delete(id);

    if (!affected) {
      throw new BadRequestException(`Product with id ${id} not found`);
    }

    return;
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error. Check server logs',
    );
  }
}
