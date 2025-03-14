import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignupUserDto } from './dto/signupUserDto';
import { LoginDto } from './dto/login.dto';
import { SignupOrganizationDto } from './dto/signup-organization.dto';
import { Tenant } from 'src/entity/tenant/tenant.entity';
import { User } from 'src/entity/user/user.entity';
import { LoginResponse } from './dto/login-response.dto';
import { SignupResponse } from './dto/signup-response.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => SignupResponse, {
    description: 'Register a new organization (Admin signup)',
  })
  async signupOrganization(
    @Args('signupInput') signupDto: SignupOrganizationDto,
  ): Promise<SignupResponse> {
    return this.authService.signupOrganization(signupDto);
  }

  // @Mutation(() => String, { description: 'Signup for invited users' })
  // async signupUser(
  //   @Args('signupInput') signupDto: SignupUserDto,
  // ): Promise<string> {
  //   const { token } = await this.authService.signupUser(signupDto);
  //   return token;
  // }

  @Mutation(() => LoginResponse, { description: 'Login existing user' }) // ✅ Updated return type
  async login(@Args('loginInput') loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }
}
