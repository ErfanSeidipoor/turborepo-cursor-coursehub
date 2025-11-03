import { MigrationInterface, QueryRunner } from 'typeorm';
import { DatabaseCreateForeignKey, DatabaseCreateTable } from './utils';

export class CreateInstructorsTable1762165499123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create instructors table
    await DatabaseCreateTable(queryRunner, 'instructors', [
      {
        name: 'user_id',
        type: 'uuid',
        isUnique: true,
        isNullable: false,
      },
      {
        name: 'bio',
        type: 'text',
        isNullable: true,
      },
      {
        name: 'rating',
        type: 'numeric',
        precision: 3,
        scale: 2,
        isNullable: true,
      },
    ]);

    // Create foreign key from instructors.user_id to users.id
    await DatabaseCreateForeignKey(
      queryRunner,
      'instructors',
      'users',
      'user_id',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.query(
      `ALTER TABLE "instructors" DROP CONSTRAINT IF EXISTS "FK_instructors_users"`,
    );

    // Drop table
    await queryRunner.dropTable('instructors');
  }
}
