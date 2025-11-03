import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Enrollment } from './enrollment.entity';
import { Lesson } from './lesson.entity';

/**
 * TABLE-NAME: progress
 * TABLE-DESCRIPTION: Tracks a student's completion status for each lesson within an enrollment
 * TABLE-IMPORTANT-CONSTRAINTS:
 *   - enrollment_id is a foreign key referencing enrollments.id with CASCADE on delete
 *   - lesson_id is a foreign key referencing lessons.id with CASCADE on delete
 *   - is_completed is a boolean flag indicating completion status
 *   - last_watched_time stores the last position watched in seconds
 *   - inherits id (UUID), createdAt, updatedAt, and deletedAt from BaseEntity
 * TABLE-RELATIONSHIPS:
 *   - Many-to-one relationship with Enrollment (each progress record belongs to one enrollment)
 *   - Many-to-one relationship with Lesson (each progress record belongs to one lesson)
 */
@Entity('progress')
export class Progress extends BaseEntity {
  /**
   * COLUMN-DESCRIPTION: Foreign key referencing the enrollment this progress belongs to
   */
  @Column({
    type: 'uuid',
    name: 'enrollment_id',
    nullable: false,
  })
  public enrollmentId: string;

  /**
   * COLUMN-DESCRIPTION: Foreign key referencing the lesson being tracked
   */
  @Column({
    type: 'uuid',
    name: 'lesson_id',
    nullable: false,
  })
  public lessonId: string;

  /**
   * COLUMN-DESCRIPTION: Boolean flag indicating whether the lesson has been completed
   */
  @Column({
    type: 'boolean',
    name: 'is_completed',
    nullable: false,
    default: false,
  })
  public isCompleted: boolean;

  /**
   * COLUMN-DESCRIPTION: Last watched position in the lesson content (in seconds)
   */
  @Column({
    type: 'integer',
    name: 'last_watched_time',
    nullable: true,
    default: 0,
  })
  public lastWatchedTime: number | null;

  /**
   * RELATIONSHIP-DESCRIPTION: Many-to-one relationship with Enrollment entity
   */
  @ManyToOne(() => Enrollment, (enrollment) => enrollment.progresses)
  @JoinColumn({ name: 'enrollment_id' })
  public enrollment: Enrollment;

  /**
   * RELATIONSHIP-DESCRIPTION: Many-to-one relationship with Lesson entity
   */
  @ManyToOne(() => Lesson, (lesson) => lesson.progresses)
  @JoinColumn({ name: 'lesson_id' })
  public lesson: Lesson;
}
