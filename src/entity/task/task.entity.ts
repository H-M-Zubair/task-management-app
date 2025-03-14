import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from '../tenant/tenant.entity';
import { User } from '../user/user.entity';

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

registerEnumType(TaskStatus, { name: 'TaskStatus' });

@ObjectType()
@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @Field(() => Tenant)
  tenant: Tenant;

  @Column()
  @Field()
  title: string;

  @Column({ type: 'text' })
  @Field()
  description: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  @Field(() => TaskStatus)
  status: TaskStatus;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @Field(() => User, { nullable: true })
  assignedTo: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Field(() => User)
  createdBy: User;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
