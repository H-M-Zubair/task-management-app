import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { TaskResolver } from './task.resolver';
import { Task } from 'src/entity/task/task.entity';
import { User } from 'src/entity/user/user.entity';
import { Tenant } from 'src/entity/tenant/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User, Tenant])],
  providers: [TaskService, TaskResolver],
  exports: [TaskService, TypeOrmModule],
})
export class TaskModule {}
