import { MigrationInterface, QueryRunner } from 'typeorm';
import { DatabaseCreateForeignKey, DatabaseCreateTable } from './utils';

export class CreateCoursesSectionsLessonsTables1762165958622
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create courses table
    await DatabaseCreateTable(queryRunner, 'courses', [
      {
        name: 'instructor_id',
        type: 'uuid',
        isNullable: false,
      },
      {
        name: 'title',
        type: 'varchar',
        length: '255',
        isNullable: false,
      },
      {
        name: 'description',
        type: 'text',
        isNullable: true,
      },
      {
        name: 'status',
        type: 'varchar',
        length: '50',
        isNullable: false,
        default: "'DRAFT'",
      },
    ]);

    // Create foreign key from courses.instructor_id to instructors.id
    await DatabaseCreateForeignKey(
      queryRunner,
      'courses',
      'instructors',
      'instructor_id',
    );

    // Create sections table
    await DatabaseCreateTable(queryRunner, 'sections', [
      {
        name: 'course_id',
        type: 'uuid',
        isNullable: false,
      },
      {
        name: 'title',
        type: 'varchar',
        length: '255',
        isNullable: false,
      },
      {
        name: 'order_index',
        type: 'integer',
        isNullable: false,
        default: 0,
      },
    ]);

    // Create foreign key from sections.course_id to courses.id
    await DatabaseCreateForeignKey(
      queryRunner,
      'sections',
      'courses',
      'course_id',
    );

    // Create lessons table
    await DatabaseCreateTable(queryRunner, 'lessons', [
      {
        name: 'section_id',
        type: 'uuid',
        isNullable: false,
      },
      {
        name: 'title',
        type: 'varchar',
        length: '255',
        isNullable: false,
      },
      {
        name: 'content_url',
        type: 'text',
        isNullable: true,
      },
    ]);

    // Create foreign key from lessons.section_id to sections.id
    await DatabaseCreateForeignKey(
      queryRunner,
      'lessons',
      'sections',
      'section_id',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop lessons table (drop foreign key first, then table)
    await queryRunner.query(
      `ALTER TABLE "lessons" DROP CONSTRAINT IF EXISTS "FK_lessons_sections"`,
    );
    await queryRunner.dropTable('lessons');

    // Drop sections table
    await queryRunner.query(
      `ALTER TABLE "sections" DROP CONSTRAINT IF EXISTS "FK_sections_courses"`,
    );
    await queryRunner.dropTable('sections');

    // Drop courses table
    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "FK_courses_instructors"`,
    );
    await queryRunner.dropTable('courses');
  }
}
