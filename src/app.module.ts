import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';

import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { TenantModule } from './modules/tenant/tenant.module';
import { TenantResolver } from './modules/tenant/tenant.resolver';

import { AuthModule } from './modules/auth/auth.module';
import { AuthResolver } from './modules/auth/auth.resolver';
import { AuthService } from './modules/auth/auth.service';

import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { TaskResolver } from './modules/task/task.resolver';
import { TaskService } from './modules/task/task.service';
import { TaskModule } from './modules/task/task.module';
import configOrm from './config/ormConfig';
import { TenantMiddleware } from './middlewares/tenant.middleware';

@Module({
  imports: [
    // ✅ Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ✅ TypeORM Configuration
    TypeOrmModule.forRoot(configOrm),

    // ✅ GraphQL Configuration
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // Auto-generate schema
    }),

    // ✅ Feature Modules
    TenantModule,
    AuthModule,
    UserModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TenantResolver,
    AuthResolver,
    AuthService,
    TaskResolver,
    TaskService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('task', 'user'); // ✅ Apply only to specific routes (exclude 'auth' and 'graphql')
  }
}
