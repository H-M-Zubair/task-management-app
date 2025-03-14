import { Field, ObjectType } from '@nestjs/graphql';
import { Tenant } from 'src/entity/tenant/tenant.entity';

@ObjectType()
export class SignupResponse {
  @Field()
  token: string;

  @Field(() => Tenant)
  tenant: Tenant;
}
