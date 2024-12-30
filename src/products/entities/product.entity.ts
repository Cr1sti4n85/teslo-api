import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductImage } from './product-image.entity';
import { User } from '../../auth/entities/user.entity';

//Representacion de objeto en base de datos
@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    example: '20508b4a-4e10-4162-9954-ef5d3882fc32',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Men"s T-Shirt',
    description: 'Product title',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true, //constraint
  })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Product price',
  })
  @Column('float', { default: 0 })
  price: number;

  @ApiProperty({
    example: 'Texto de ejemplo',
    description: 'Product description',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: 'mens_t_shirt',
    description: 'Product slug for SEO',
  })
  @Column('text', { unique: true })
  slug: string;

  @ApiProperty({
    example: 100,
    description: 'Product stock',
    default: 0,
  })
  @Column('int', { default: 0 })
  stock: number;

  @ApiProperty({
    example: ['S', 'M', 'L'],
    description: 'Product sizes',
  })
  @Column('text', { array: true })
  sizes: string[];

  @ApiProperty({
    example: 'Men',
    description: 'Product gender',
  })
  @Column('text')
  gender: string;

  @ApiProperty({
    example: '[men, shirt]',
    description: 'Product tags',
  })
  @Column('text', { array: true, default: [] })
  tags: string[];

  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true, //cuando se elimine un producto se eliminan las imagenes
    eager: true, //traer imagenes al traer producto
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
