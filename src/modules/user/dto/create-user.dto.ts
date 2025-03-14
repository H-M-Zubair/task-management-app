import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/entity/user/user.entity';

@InputType()
export class InviteUserDto {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Field()
  @IsUUID()
  tenantId: string; // Ensure user belongs to a specific tenant
}
