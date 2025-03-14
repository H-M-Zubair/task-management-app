import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from 'src/entity/tenant/tenant.entity';
import { TenantService } from './tenant.service';
import { TenantResolver } from './tenant.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  providers: [TenantService, TenantResolver],
  exports: [TenantService, TypeOrmModule],
})
export class TenantModule {}
