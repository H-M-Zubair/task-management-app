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

  // 🚀 Signup for the first user in a new organization
  async signupOrganization(
    signupDto: SignupOrganizationDto,
  ): Promise<{ token: string; tenant: Tenant }> {
    const { email, password, organizationName } = signupDto;
    console.log('User inputs are ', email, password, organizationName);
    if (!organizationName) {
      throw new Error('organizationName is required');
    }
    //Such Email Already exists or not
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }
    // Step 1: Create a new Tenant (Organization)
    const tenant = this.tenantRepository.create({
      name: organizationName,
      schemaName: `${organizationName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`, // Example schema naming
    });
    await this.tenantRepository.save(tenant);

    // Step 2: Hash Password and Create First User (Admin)
    const user = this.userRepository.create({
      email,
      passwordHash: password,
      tenant,
      role: UserRole.ADMIN,
    });

    await this.userRepository.save(user);

    // Step 3: Generate JWT Token

    const token = this.jwtService.sign({
      id: user.id,
      tenantId: tenant.id,
      role: user.role,
    });

    return { token, tenant };
  }

  // // 🚀 Signup for invited users
  // async signupUser(signupDto: SignupUserDto): Promise<{ token: string }> {
  //   const { email, password, tenantId } = signupDto;

  //   // Step 1: Verify Tenant Exists
  //   const tenant = await this.tenantRepository.findOne({
  //     where: { id: tenantId },
  //   });
  //   if (!tenant) {
  //     throw new UnauthorizedException('Invalid tenant ID');
  //   }

  //   // Step 2: Verify User Exists and Was Invited
  //   const existingUser = await this.userRepository.findOne({
  //     where: { email, tenant },
  //   });
  //   if (!existingUser) {
  //     throw new UnauthorizedException('User must be invited first');
  //   }

  //   // Step 3: Hash Password and Update User Record
  //   existingUser.passwordHash = password;
  //   await this.userRepository.save(existingUser);

  //   // Step 4: Generate JWT Token
  //   return {
  //     token: this.jwtService.sign({
  //       id: existingUser.id,
  //       tenantId: tenant.id,
  //       role: existingUser.role,
  //     }),
  //   };
  // }

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

    // Generate JWT token
    const token = this.jwtService.sign({
      id: user.id,
      tenantId: user.tenant.id,
      role: user.role,
    });

    return { token, user };
  }
}
