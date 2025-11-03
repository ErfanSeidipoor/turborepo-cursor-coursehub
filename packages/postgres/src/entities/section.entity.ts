import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Course } from './course.entity';
import { Lesson } from './lesson.entity';

/**
 * TABLE-NAME: sections
 * TABLE-DESCRIPTION: Logical grouping of lessons within a course
 * TABLE-IMPORTANT-CONSTRAINTS:
 *   - course_id is a foreign key referencing courses.id with CASCADE on delete
 *   - title is required and has maximum 255 characters
 *   - order_index defines the display order of sections within a course
 *   - inherits id (UUID), createdAt, updatedAt, and deletedAt from BaseEntity
 * TABLE-RELATIONSHIPS:
 *   - Many-to-one relationship with Course (each section belongs to one course)
 *   - One-to-many relationship with Lesson (a section can have multiple lessons)
 */
@Entity('sections')
export class Section extends BaseEntity {
  /**
   * COLUMN-DESCRIPTION: Foreign key referencing the course this section belongs to
   */
  @Column({
    type: 'uuid',
    name: 'course_id',
    nullable: false,
  })
  public courseId: string;

  /**
   * COLUMN-DESCRIPTION: Title of the section, maximum 255 characters
   */
  @Column({
    type: 'varchar',
    length: 255,
    name: 'title',
    nullable: false,
  })
  public title: string;

  /**
   * COLUMN-DESCRIPTION: Order index for displaying sections in sequence within a course
   */
  @Column({
    type: 'integer',
    name: 'order_index',
    nullable: false,
    default: 0,
  })
  public orderIndex: number;

  /**
   * RELATIONSHIP-DESCRIPTION: Many-to-one relationship with Course entity
   */
  @ManyToOne(() => Course, (course) => course.sections)
  @JoinColumn({ name: 'course_id' })
  public course: Course;

  /**
   * RELATIONSHIP-DESCRIPTION: One-to-many relationship with Lesson entity
   */
  @OneToMany(() => Lesson, (lesson) => lesson.section)
  public lessons: Lesson[];
}
