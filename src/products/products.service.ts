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
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ProductImage } from './entities/product-image.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {
  //logger para ver errores en consola
  private readonly logger = new Logger('ProductService');
  //uso del patron repositorio para instanciar la entity Product
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    //para obtener cadena de conexion y usuario de BD
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
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

      const { images = [], ...productDetails } = createProductDto;

      //create in memory
      const product = this.productRepository.create({
        ...productDetails,
        user,
        images: images.map((image) =>
          //por cada imagen del array se debe crear un registro en la tabla productImages
          this.productImageRepository.create({ url: image }),
        ),
      });

      //save to db
      await this.productRepository.save(product);

      return { ...product, images: images };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: { images: true }, //para traer data de tabla images
    });

    return products.map((product) => ({
      ...product,
      images: product.images.map((img) => img.url),
    }));
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
        .leftJoinAndSelect('Product.images', 'images') //para traer data de tabla images
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

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);

    return {
      ...rest,
      images: images.map((img) => img.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    //el query runner permite ejecutar cierta cantidad de queries y si salen bien
    //se hace commit, si no se hace rollback
    //Create query Runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //si vienen imagenes, se van a borrar todas las imagenes previas
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        product.images = images.map((img) =>
          this.productImageRepository.create({ url: img }),
        );
      }

      product.user = user;

      await queryRunner.manager.save(product);

      //si todo sale bien se hace commit
      await queryRunner.commitTransaction();
      await queryRunner.release();

      //si se retorna product sin haber enviado imagenes, el producto retorna sin imagenes incluso
      //si es que tuviera. Por eso se debe hacer otra consulta a la bd para retornar el producto con sus imagenes
      return this.findOnePlain(id);
      // return product;

      // await this.productRepository.save(product);
    } catch (error) {
      //si hay error se hace rollback
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDbExceptions(error);
    }
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

  //solo para modo desarrollo
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }
}
