import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { EnvEnum } from './env.enum';
import { entities } from './entities';
import { join } from 'path';

config();

for (const key of Object.keys(EnvEnum)) {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} must be defined`);
  }
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env[EnvEnum.POSTGRES__DB_HOST],
  username: process.env[EnvEnum.POSTGRES__DB_USERNAME],
  password: process.env[EnvEnum.POSTGRES__DB_PASSWORD],
  database: process.env[EnvEnum.POSTGRES__DB_DATABASE],
  port: Number(process.env[EnvEnum.POSTGRES__DB_PORT]),
  synchronize: false,
  migrations: [join(__dirname, 'migrations', '*.ts')],
  entities: [...entities],
};

const connectionSource = new DataSource(dataSourceOptions);

export default connectionSource;
