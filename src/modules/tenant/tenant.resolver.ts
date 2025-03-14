import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { TenantService } from './tenant.service';

@Resolver()
export class TenantResolver {
  constructor(private readonly tenantService: TenantService) {}
  @Mutation(() => String, {
    description: 'Invite another Manager',
  })
  //query to say Hello From TenantResolver
  @Query(() => String)
  hello(): string {
    return 'Hello from TenantResolver!';
  }
}
