import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '@repo/postgres/data-source';
import { entities } from '@repo/postgres/entities/index';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { services } from './services';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => dataSourceOptions,
      inject: [],
      dataSourceFactory: async () => {
        return addTransactionalDataSource(new DataSource(dataSourceOptions));
      },
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [...services],
  exports: [...services, TypeOrmModule.forFeature(entities)],
})
export class PostgresModule {}
