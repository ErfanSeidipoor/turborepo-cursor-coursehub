/**
 * Status values for courses in the courses table
 */
export enum CoursesStatusEnum {
  /**
   * Course is in draft mode and not visible to students
   */
  DRAFT = 'DRAFT',

  /**
   * Course is under review by administrators
   */
  REVIEW = 'REVIEW',

  /**
   * Course is published and visible to students
   */
  PUBLISHED = 'PUBLISHED',

  /**
   * Course is archived and no longer active
   */
  ARCHIVED = 'ARCHIVED',

  /**
   * Course is marked as deleted (soft delete)
   */
  DELETED = 'DELETED',
}
