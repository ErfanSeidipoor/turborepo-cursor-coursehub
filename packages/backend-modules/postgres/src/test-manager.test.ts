import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../../../../.env'),
  override: true,
});
if (process.env['POSTGRES__DB_DATABASE']) {
  process.env['POSTGRES__DB_DATABASE'] =
    process.env['POSTGRES__DB_DATABASE'] + '-test';
}

import { Test, TestingModule } from '@nestjs/testing';
import { PostgresModule } from './module';
import { DataSource, Repository } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { getRepositoryToken } from '@nestjs/typeorm';

export class TestManager {
  public static module: TestingModule;
  public static dataSource: DataSource;

  static async beforeAll(): Promise<TestingModule> {
    initializeTransactionalContext();

    if (!TestManager.module) {
      TestManager.module = await Test.createTestingModule({
        imports: [PostgresModule],
        providers: [],
      }).compile();
    }

    if (!TestManager.dataSource) {
      TestManager.dataSource = TestManager.module.get<DataSource>(DataSource);
    }

    return TestManager.module;
  }

  static async runMigration(): Promise<void> {
    await this.dataSource.runMigrations();
  }

  static async dropDatabase(): Promise<void> {
    await this.dataSource.dropDatabase();
  }

  static async beforeEach(): Promise<void> {
    await this.dropDatabase();
    await this.runMigration();

    jest.clearAllMocks();
  }

  static getHandler<T>(type: new (...args: any[]) => T): T {
    return TestManager.module.get<T>(type);
  }

  static getRepository<T>(entity: new (...args: any[]) => T): Repository<T> {
    return TestManager.module.get<Repository<T>>(getRepositoryToken(entity));
  }

  static async afterAll(): Promise<void> {
    if (TestManager.dataSource) {
      await TestManager.dataSource.destroy();
    }
    if (TestManager.module) {
      await TestManager.module.close();
    }
  }
}
