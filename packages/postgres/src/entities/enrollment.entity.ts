import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Course } from './course.entity';
import { Progress } from './progress.entity';

/**
 * TABLE-NAME: enrollments
 * TABLE-DESCRIPTION: Records a student's active registration in a course. Serves as a junction table linking users to courses.
 * TABLE-IMPORTANT-CONSTRAINTS:
 *   - Composite unique key on (user_id, course_id) prevents duplicate enrollments
 *   - user_id is a foreign key referencing users.id with CASCADE on delete
 *   - course_id is a foreign key referencing courses.id with CASCADE on delete
 *   - completion_status is stored as numeric(5,2) representing percentage (0.00 to 100.00)
 *   - enrollment_date defaults to current timestamp
 *   - inherits id (UUID), createdAt, updatedAt, and deletedAt from BaseEntity
 * TABLE-RELATIONSHIPS:
 *   - Many-to-one relationship with User (each enrollment belongs to one user)
 *   - Many-to-one relationship with Course (each enrollment belongs to one course)
 *   - One-to-many relationship with Progress (an enrollment can have multiple progress records)
 */
@Entity('enrollments')
@Unique('UQ_enrollments_user_course', ['userId', 'courseId'])
export class Enrollment extends BaseEntity {
  /**
   * COLUMN-DESCRIPTION: Foreign key referencing the user who is enrolled in the course
   */
  @Column({
    type: 'uuid',
    name: 'user_id',
    nullable: false,
  })
  public userId: string;

  /**
   * COLUMN-DESCRIPTION: Foreign key referencing the course the user is enrolled in
   */
  @Column({
    type: 'uuid',
    name: 'course_id',
    nullable: false,
  })
  public courseId: string;

  /**
   * COLUMN-DESCRIPTION: Date and time when the user enrolled in the course
   */
  @Column({
    type: 'timestamptz',
    name: 'enrollment_date',
    nullable: false,
    default: () => 'now()',
  })
  public enrollmentDate: Date;

  /**
   * COLUMN-DESCRIPTION: Percentage of course completion (0.00 to 100.00)
   */
  @Column({
    type: 'numeric',
    name: 'completion_status',
    nullable: false,
    precision: 5,
    scale: 2,
    default: 0,
  })
  public completionStatus: number;

  /**
   * RELATIONSHIP-DESCRIPTION: Many-to-one relationship with User entity
   */
  @ManyToOne(() => User, (user) => user.enrollments)
  @JoinColumn({ name: 'user_id' })
  public user: User;

  /**
   * RELATIONSHIP-DESCRIPTION: Many-to-one relationship with Course entity
   */
  @ManyToOne(() => Course, (course) => course.enrollments)
  @JoinColumn({ name: 'course_id' })
  public course: Course;

  /**
   * RELATIONSHIP-DESCRIPTION: One-to-many relationship with Progress entity
   */
  @OneToMany(() => Progress, (progress) => progress.enrollment)
  public progresses: Progress[];
}
