import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/entity/user/user.entity';
import { Tenant } from 'src/entity/tenant/tenant.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module'; // ✅ Import UserModule
import { TenantModule } from '../tenant/tenant.module'; // ✅ Import TenantModule

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tenant]), // ✅ Register entities
    ConfigModule,
    UserModule, // ✅ Import UserModule to fix UserRepository issue
    TenantModule, // ✅ Import TenantModule to fix TenantRepository issue
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
  exports: [AuthService, JwtModule], // ✅ Export AuthService & JwtModule if needed in other modules
})
export class AuthModule {}
