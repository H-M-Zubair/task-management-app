import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User, UserRole } from 'src/entity/user/user.entity';
import { InviteUserDto } from './dto/create-user.dto';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User, { description: 'Admin invites a user' })
  @UseGuards(GqlAuthGuard) // ✅ Ensure user is authenticated
  async inviteUser(
    @Args('inviteInput') inviteDto: InviteUserDto,
    @CurrentUser() inviter: User, // ✅ Get the currently logged-in inviter
  ): Promise<User> {
    console.log('USER DATA FROM RESOLVER.......: ', inviteDto);

    // ✅ Ensure only Admins can invite users
    if (inviter.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only Admins can invite users');
    }

    return this.userService.inviteUser(inviter, inviteDto);
  }

  @Query(() => [User], { description: 'Fetch users of a specific tenant' })
  async getUsersByTenant(@Args('tenantId') tenantId: string): Promise<User[]> {
    return this.userService.getUsersByTenant(tenantId);
  }

  @Mutation(() => Boolean, { description: 'Admin deletes a user' })
  @UseGuards(GqlAuthGuard) // Only authenticated users can access this
  async deleteUser(
    @Args('userId') userId: string, // ID of the user to delete
    @Args('tenantId') tenantId: string, // Tenant ID where user is to be deleted
    @CurrentUser() currentUser: User, // Logged-in user
  ): Promise<boolean> {
    // Delegate the business logic to the service
    return this.userService.deleteUser(currentUser, userId, tenantId);
  }
}
