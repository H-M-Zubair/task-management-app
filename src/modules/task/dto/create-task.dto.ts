import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateTaskDto {
  @Field()
  @IsNotEmpty()
  title: string; // Task title should not be empty

  @Field()
  @IsNotEmpty()
  description: string; // Task description should not be empty

  @Field()
  @IsEmail()
  @IsNotEmpty()
  assignedToEmail: string; // Employee email to assign the task

  @Field()
  @IsNotEmpty()
  tenantId: string; // Ensure task belongs to a specific tenant and tenant ID is valid
}
