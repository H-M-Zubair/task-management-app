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

    if (inviter.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only Admins can invite users');
    }

    const tenant = await this.tenantRepository.findOne({
      where: { id: inviter.tenant.id },
    });

    if (!tenant) {
      throw new ConflictException('Invalid tenant');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email, tenant },
    });

    if (existingUser) {
      throw new ConflictException('User already exists in this tenant');
    }

    const user = this.userRepository.create({
      email,
      passwordHash: password,
      role,
      tenant,
    });

    await this.userRepository.save(user);

    return this.userRepository.findOne({
      where: { id: user.id },
      relations: ['tenant'],
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
      relations: ['tenant'],
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
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only Admins can delete users');
    }

    const userToDelete = await this.findOne(userId);
    if (userToDelete.tenant.id !== tenantId) {
      throw new ForbiddenException(
        'You can only delete users from the same tenant',
      );
    }

    await this.userRepository.remove(userToDelete);
    return true;
  }
}
