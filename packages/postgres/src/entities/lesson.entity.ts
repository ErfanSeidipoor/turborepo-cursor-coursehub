import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Section } from './section.entity';
import { Progress } from './progress.entity';

/**
 * TABLE-NAME: lessons
 * TABLE-DESCRIPTION: The individual learning content unit (video, quiz, article)
 * TABLE-IMPORTANT-CONSTRAINTS:
 *   - section_id is a foreign key referencing sections.id with CASCADE on delete
 *   - title is required and has maximum 255 characters
 *   - content_url is optional and stores the URL to the lesson content
 *   - inherits id (UUID), createdAt, updatedAt, and deletedAt from BaseEntity
 * TABLE-RELATIONSHIPS:
 *   - Many-to-one relationship with Section (each lesson belongs to one section)
 *   - One-to-many relationship with Progress (a lesson can have multiple progress records)
 */
@Entity('lessons')
export class Lesson extends BaseEntity {
  /**
   * COLUMN-DESCRIPTION: Foreign key referencing the section this lesson belongs to
   */
  @Column({
    type: 'uuid',
    name: 'section_id',
    nullable: false,
  })
  public sectionId: string;

  /**
   * COLUMN-DESCRIPTION: Title of the lesson, maximum 255 characters
   */
  @Column({
    type: 'varchar',
    length: 255,
    name: 'title',
    nullable: false,
  })
  public title: string;

  /**
   * COLUMN-DESCRIPTION: URL to the lesson content (video, quiz, article, etc.)
   */
  @Column({
    type: 'text',
    name: 'content_url',
    nullable: true,
  })
  public contentUrl: string | null;

  /**
   * RELATIONSHIP-DESCRIPTION: Many-to-one relationship with Section entity
   */
  @ManyToOne(() => Section, (section) => section.lessons)
  @JoinColumn({ name: 'section_id' })
  public section: Section;

  /**
   * RELATIONSHIP-DESCRIPTION: One-to-many relationship with Progress entity
   */
  @OneToMany(() => Progress, (progress) => progress.lesson)
  public progresses: Progress[];
}
