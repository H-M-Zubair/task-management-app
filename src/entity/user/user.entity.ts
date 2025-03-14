import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { Tenant } from '../tenant/tenant.entity';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  USER = 'User',
}

registerEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { onDelete: 'CASCADE' })
  @Field(() => Tenant)
  tenant: Tenant;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column()
  passwordHash: string; // ✅ Will store hashed password

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  role: UserRole;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  // 🔹 Hash password before saving user
  @BeforeInsert()
  async hashPassword() {
    if (!this.passwordHash) {
      console.error('❌ Password is missing before hashing!');
      throw new Error('Password is required before hashing');
    }

    const saltRounds = 10;
    console.log('🔹 Before hashing, password:', this.passwordHash);
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    console.log('✅ Hashed password:', this.passwordHash);
  }
}
