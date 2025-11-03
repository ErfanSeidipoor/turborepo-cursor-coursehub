import { MigrationInterface, QueryRunner } from 'typeorm';
import { DatabaseCreateTable } from './utils';

export class CreateUsersTable1753387592509 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await DatabaseCreateTable(queryRunner, 'users', [
      {
        name: 'username',
        type: 'varchar',
        length: '255',
        isUnique: true,
        isNullable: false,
      },
      {
        name: 'password',
        type: 'varchar',
        length: '255',
        isNullable: false,
      },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
