import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, isNotEmpty, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class SignupOrganizationDto {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  password: string;

  @Field()
  @IsNotEmpty()
  organizationName: string; // The new organization name
}
