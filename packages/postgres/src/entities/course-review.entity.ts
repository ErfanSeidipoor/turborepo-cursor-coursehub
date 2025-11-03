import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Course } from './course.entity';

/**
 * TABLE-NAME: course_reviews
 * TABLE-DESCRIPTION: Stores student feedback, ratings, and text reviews for courses
 * TABLE-IMPORTANT-CONSTRAINTS:
 *   - user_id is a foreign key referencing users.id with CASCADE on delete
 *   - course_id is a foreign key referencing courses.id with CASCADE on delete
 *   - rating is a smallint between 1 and 5
 *   - review_text is optional text field
 *   - inherits id (UUID), createdAt, updatedAt, and deletedAt from BaseEntity
 * TABLE-RELATIONSHIPS:
 *   - Many-to-one relationship with User (each review belongs to one user)
 *   - Many-to-one relationship with Course (each review belongs to one course)
 */
@Entity('course_reviews')
export class CourseReview extends BaseEntity {
  /**
   * COLUMN-DESCRIPTION: Foreign key referencing the user who wrote the review
   */
  @Column({
    type: 'uuid',
    name: 'user_id',
    nullable: false,
  })
  public userId: string;

  /**
   * COLUMN-DESCRIPTION: Foreign key referencing the course being reviewed
   */
  @Column({
    type: 'uuid',
    name: 'course_id',
    nullable: false,
  })
  public courseId: string;

  /**
   * COLUMN-DESCRIPTION: Rating score from 1 to 5 stars
   */
  @Column({
    type: 'smallint',
    name: 'rating',
    nullable: false,
  })
  public rating: number;

  /**
   * COLUMN-DESCRIPTION: Optional text review providing detailed feedback
   */
  @Column({
    type: 'text',
    name: 'review_text',
    nullable: true,
  })
  public reviewText: string | null;

  /**
   * RELATIONSHIP-DESCRIPTION: Many-to-one relationship with User entity
   */
  @ManyToOne(() => User, (user) => user.courseReviews)
  @JoinColumn({ name: 'user_id' })
  public user: User;

  /**
   * RELATIONSHIP-DESCRIPTION: Many-to-one relationship with Course entity
   */
  @ManyToOne(() => Course, (course) => course.courseReviews)
  @JoinColumn({ name: 'course_id' })
  public course: Course;
}
