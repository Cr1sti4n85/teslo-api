import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false }) //para que no aparezca la pass en query select
  password: string;

  @Column('text')
  fullName: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('text', { array: true, default: ['user'] })
  roles: string[];

  @BeforeInsert()
  changeEmailToLowercase() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  updateEmailToLowercase() {
    this.email = this.email.toLowerCase().trim();
  }
}
