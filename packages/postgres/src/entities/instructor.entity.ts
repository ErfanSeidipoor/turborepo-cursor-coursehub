import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

/**
 * TABLE-NAME: instructors
 * TABLE-DESCRIPTION: Stores instructor-specific details and statistics for users acting as instructors
 * TABLE-IMPORTANT-CONSTRAINTS:
 *   - user_id must be unique (one user can only be one instructor)
 *   - user_id is a foreign key referencing users.id with CASCADE on delete
 *   - bio is nullable (instructors may not have a bio)
 *   - rating is nullable with precision 3 and scale 2 (e.g., 4.50)
 *   - inherits id (UUID), createdAt, updatedAt, and deletedAt from BaseEntity
 * TABLE-RELATIONSHIPS:
 *   - One-to-one relationship with User (each instructor is associated with exactly one user)
 */
@Entity('instructors')
export class Instructor extends BaseEntity {
  /**
   * COLUMN-DESCRIPTION: Foreign key referencing the user who is an instructor, must be unique
   */
  @Column({
    type: 'uuid',
    name: 'user_id',
    unique: true,
    nullable: false,
  })
  public userId: string;

  /**
   * COLUMN-DESCRIPTION: Biographical information about the instructor
   */
  @Column({
    type: 'text',
    name: 'bio',
    nullable: true,
  })
  public bio: string | null;

  /**
   * COLUMN-DESCRIPTION: Average rating for the instructor with precision 3 and scale 2 (e.g., 4.50)
   */
  @Column({
    type: 'numeric',
    precision: 3,
    scale: 2,
    name: 'rating',
    nullable: true,
  })
  public rating: number | null;

  /**
   * RELATIONSHIP-DESCRIPTION: One-to-one relationship with User entity
   */
  @OneToOne(() => User, (user) => user.instructor)
  @JoinColumn({ name: 'user_id' })
  public user: User;
}
