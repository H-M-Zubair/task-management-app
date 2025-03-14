import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { User } from 'src/entity/user/user.entity';
import { Tenant } from 'src/entity/tenant/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Tenant])], // ✅ Register User entity
  providers: [UserService, UserResolver],
  exports: [UserService, TypeOrmModule], // ✅ Export TypeOrmModule to make UserRepository available
})
export class UserModule {}
