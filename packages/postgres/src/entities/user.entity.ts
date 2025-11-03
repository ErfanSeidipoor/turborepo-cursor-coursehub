import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';
/**
 * TABLE-NAME: users
 * TABLE-DESCRIPTION: Stores user authentication credentials and basic user information
 * TABLE-IMPORTANT-CONSTRAINTS:
 *   - username must be unique across all users
 *   - password is excluded from default queries (select: false)
 *   - inherits id (UUID), createdAt, and updatedAt from BaseEntity
 * TABLE-RELATIONSHIPS:
 *   - One-to-one relationship with Instructor (optional, when user has instructor privileges)
 *   - One-to-many relationship with Enrollment (enrollments reference this user)
 *   - One-to-many relationship with CourseReview (course reviews reference this user)
 */
@Entity('users')
export class User extends BaseEntity {
  /**
   * COLUMN-DESCRIPTION: Unique username for user authentication, maximum 255 characters
   */
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    name: 'username',
  })
  public username: string;

  /**
   * COLUMN-DESCRIPTION: Hashed password for user authentication, excluded from default queries for security
   */
  @Column({
    type: 'varchar',
    length: 255,
    name: 'password',
    select: false,
  })
  public password: string;
}
