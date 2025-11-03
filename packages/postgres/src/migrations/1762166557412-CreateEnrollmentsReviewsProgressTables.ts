import { MigrationInterface, QueryRunner, TableUnique } from 'typeorm';
import { DatabaseCreateForeignKey, DatabaseCreateTable } from './utils';

export class CreateEnrollmentsReviewsProgressTables1762166557412
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enrollments table
    await DatabaseCreateTable(queryRunner, 'enrollments', [
      {
        name: 'user_id',
        type: 'uuid',
        isNullable: false,
      },
      {
        name: 'course_id',
        type: 'uuid',
        isNullable: false,
      },
      {
        name: 'enrollment_date',
        type: 'timestamptz',
        isNullable: false,
        default: 'now()',
      },
      {
        name: 'completion_status',
        type: 'numeric',
        precision: 5,
        scale: 2,
        isNullable: false,
        default: 0,
      },
    ]);

    // Create composite unique key for enrollments (user_id, course_id)
    await queryRunner.createUniqueConstraint(
      'enrollments',
      new TableUnique({
        name: 'UQ_enrollments_user_course',
        columnNames: ['user_id', 'course_id'],
      }),
    );

    // Create foreign keys for enrollments
    await DatabaseCreateForeignKey(
      queryRunner,
      'enrollments',
      'users',
      'user_id',
    );
    await DatabaseCreateForeignKey(
      queryRunner,
      'enrollments',
      'courses',
      'course_id',
    );

    // Create course_reviews table
    await DatabaseCreateTable(queryRunner, 'course_reviews', [
      {
        name: 'user_id',
        type: 'uuid',
        isNullable: false,
      },
      {
        name: 'course_id',
        type: 'uuid',
        isNullable: false,
      },
      {
        name: 'rating',
        type: 'smallint',
        isNullable: false,
      },
      {
        name: 'review_text',
        type: 'text',
        isNullable: true,
      },
    ]);

    // Create foreign keys for course_reviews
    await DatabaseCreateForeignKey(
      queryRunner,
      'course_reviews',
      'users',
      'user_id',
    );
    await DatabaseCreateForeignKey(
      queryRunner,
      'course_reviews',
      'courses',
      'course_id',
    );

    // Create progress table
    await DatabaseCreateTable(queryRunner, 'progress', [
      {
        name: 'enrollment_id',
        type: 'uuid',
        isNullable: false,
      },
      {
        name: 'lesson_id',
        type: 'uuid',
        isNullable: false,
      },
      {
        name: 'is_completed',
        type: 'boolean',
        isNullable: false,
        default: false,
      },
      {
        name: 'last_watched_time',
        type: 'integer',
        isNullable: true,
        default: 0,
      },
    ]);

    // Create foreign keys for progress
    await DatabaseCreateForeignKey(
      queryRunner,
      'progress',
      'enrollments',
      'enrollment_id',
    );
    await DatabaseCreateForeignKey(
      queryRunner,
      'progress',
      'lessons',
      'lesson_id',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop progress table (drop foreign keys first, then table)
    await queryRunner.query(
      `ALTER TABLE "progress" DROP CONSTRAINT IF EXISTS "FK_progress_enrollments"`,
    );
    await queryRunner.query(
      `ALTER TABLE "progress" DROP CONSTRAINT IF EXISTS "FK_progress_lessons"`,
    );
    await queryRunner.dropTable('progress');

    // Drop course_reviews table
    await queryRunner.query(
      `ALTER TABLE "course_reviews" DROP CONSTRAINT IF EXISTS "FK_course_reviews_users"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_reviews" DROP CONSTRAINT IF EXISTS "FK_course_reviews_courses"`,
    );
    await queryRunner.dropTable('course_reviews');

    // Drop enrollments table
    await queryRunner.query(
      `ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "FK_enrollments_users"`,
    );
    await queryRunner.query(
      `ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "FK_enrollments_courses"`,
    );
    await queryRunner.dropTable('enrollments');
  }
}
