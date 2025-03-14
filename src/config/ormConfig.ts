import { Task } from 'src/entity/task/task.entity';
import { Tenant } from 'src/entity/tenant/tenant.entity';
import { User } from 'src/entity/user/user.entity';
import { DataSourceOptions } from 'typeorm';

const configOrm: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'mydb',
  entities: [Tenant, User, Task], // ✅ Correct entity path
  synchronize: true,

  logging: true,
  migrations: [__dirname + '/../migrations/*{.ts,.js}'], // Fixed path
  // ✅ Fix migrations path
};

export default configOrm;
