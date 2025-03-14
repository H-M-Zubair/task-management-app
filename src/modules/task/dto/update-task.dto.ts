import { Field, InputType } from '@nestjs/graphql';

import { IsUUID, IsEnum } from 'class-validator';
import { TaskStatus } from 'src/entity/task/task.entity';

@InputType()
export class UpdateTaskStatusDto {
  @Field()
  @IsUUID()
  taskId: string;

  @Field(() => TaskStatus)
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
