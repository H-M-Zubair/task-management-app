import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/entity/user/user.entity';
import { Tenant } from 'src/entity/tenant/tenant.entity';
import { SignupOrganizationDto } from './dto/signup-organization.dto';
import { SignupUserDto } from './dto/signupUserDto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,

    private jwtService: JwtService,
  ) {}

  async signupOrganization(
    signupDto: SignupOrganizationDto,
  ): Promise<{ token: string; tenant: Tenant }> {
    const { email, password, organizationName } = signupDto;
    console.log('User inputs are ', email, password, organizationName);
    if (!organizationName) {
      throw new Error('organizationName is required');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const tenant = this.tenantRepository.create({
      name: organizationName,
      schemaName: `${organizationName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`, // Example schema naming
    });
    await this.tenantRepository.save(tenant);

    const user = this.userRepository.create({
      email,
      passwordHash: password,
      tenant,
      role: UserRole.ADMIN,
    });

    await this.userRepository.save(user);

    const token = this.jwtService.sign({
      id: user.id,
      tenantId: tenant.id,
      role: user.role,
    });

    return { token, tenant };
  }

  // 🚀 User Login
  async login(loginDto: LoginDto): Promise<{ token: string; user: User }> {
    const { email, password } = loginDto;

    console.log('Login attempt for email:', email);

    // Fetch user by email
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['tenant'],
    });

    if (!user) {
      console.log('User not found:', email);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    console.log('Password match result:', passwordMatch);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({
      id: user.id,
      tenantId: user.tenant.id,
      role: user.role,
    });

    return { token, user };
  }
}
