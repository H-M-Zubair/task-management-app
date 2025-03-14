import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from 'src/entity/user/user.entity';
import { Tenant } from 'src/entity/tenant/tenant.entity';
import { InviteUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async inviteUser(inviter: User, inviteDto: InviteUserDto): Promise<User> {
    const { email, password, role } = inviteDto;
    console.log('USER DATA IS : ', email, password, role);

    // ✅ Ensure the inviter is an Admin (No Managers allowed)
    if (inviter.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only Admins can invite users');
    }

    // ✅ Ensure the user is invited within the same tenant as the inviter
    const tenant = await this.tenantRepository.findOne({
      where: { id: inviter.tenant.id },
    });

    if (!tenant) {
      throw new ConflictException('Invalid tenant');
    }

    // ✅ Check if the user already exists within the same tenant
    const existingUser = await this.userRepository.findOne({
      where: { email, tenant },
    });

    if (existingUser) {
      throw new ConflictException('User already exists in this tenant');
    }

    // ✅ Create and save new user with the same tenant as the inviter
    const user = this.userRepository.create({
      email,
      passwordHash: password,
      role,
      tenant, // Ensure user is linked to the inviter's tenant
    });

    await this.userRepository.save(user); // Save the user first

    // ✅ Return the saved user with tenant relation
    return this.userRepository.findOne({
      where: { id: user.id },
      relations: ['tenant'], // Ensure `tenant` is included in response
    });
  }

  async getUsersByTenant(tenantId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { tenant: { id: tenantId } },
      relations: ['tenant'],
    });
  }

  async findOne(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tenant'], // Ensure tenant relation is included
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async deleteUser(
    currentUser: User,
    userId: string,
    tenantId: string,
  ): Promise<boolean> {
    // Ensure the logged-in user is an Admin
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only Admins can delete users');
    }

    // Ensure the user to be deleted is from the same tenant
    const userToDelete = await this.findOne(userId); // Fetch user to delete
    if (userToDelete.tenant.id !== tenantId) {
      throw new ForbiddenException(
        'You can only delete users from the same tenant',
      );
    }

    // Proceed with deletion
    await this.userRepository.remove(userToDelete); // Remove user from the database
    return true; // Successfully deleted
  }
}
