import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Instructor } from './instructor.entity';
import { Section } from './section.entity';
import { CoursesStatusEnum } from '@repo/enums';

/**
 * TABLE-NAME: courses
 * TABLE-DESCRIPTION: Main catalog of available courses
 * TABLE-IMPORTANT-CONSTRAINTS:
 *   - instructor_id is a foreign key referencing instructors.id with CASCADE on delete
 *   - status is an enum with values: DRAFT, REVIEW, PUBLISHED, ARCHIVED, DELETED
 *   - title is required and has maximum 255 characters
 *   - description is optional text field
 *   - inherits id (UUID), createdAt, updatedAt, and deletedAt from BaseEntity
 * TABLE-RELATIONSHIPS:
 *   - Many-to-one relationship with Instructor (each course belongs to one instructor)
 *   - One-to-many relationship with Section (a course can have multiple sections)
 */
@Entity('courses')
export class Course extends BaseEntity {
  /**
   * COLUMN-DESCRIPTION: Foreign key referencing the instructor who created/owns this course
   */
  @Column({
    type: 'uuid',
    name: 'instructor_id',
    nullable: false,
  })
  public instructorId: string;

  /**
   * COLUMN-DESCRIPTION: Title of the course, maximum 255 characters
   */
  @Column({
    type: 'varchar',
    length: 255,
    name: 'title',
    nullable: false,
  })
  public title: string;

  /**
   * COLUMN-DESCRIPTION: Detailed description of the course content
   */
  @Column({
    type: 'text',
    name: 'description',
    nullable: true,
  })
  public description: string | null;

  /**
   * COLUMN-DESCRIPTION: Current status of the course (DRAFT, REVIEW, PUBLISHED, ARCHIVED, DELETED)
   */
  @Column({
    type: 'varchar',
    length: 50,
    name: 'status',
    nullable: false,
    default: CoursesStatusEnum.DRAFT,
  })
  public status: CoursesStatusEnum;

  /**
   * RELATIONSHIP-DESCRIPTION: Many-to-one relationship with Instructor entity
   */
  @ManyToOne(() => Instructor, (instructor) => instructor.courses)
  @JoinColumn({ name: 'instructor_id' })
  public instructor: Instructor;

  /**
   * RELATIONSHIP-DESCRIPTION: One-to-many relationship with Section entity
   */
  @OneToMany(() => Section, (section) => section.course)
  public sections: Section[];
}
