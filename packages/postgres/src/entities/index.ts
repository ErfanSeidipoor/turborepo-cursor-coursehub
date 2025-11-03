import { BaseEntity } from './base.entity';
import { Course } from './course.entity';
import { CourseReview } from './course-review.entity';
import { Enrollment } from './enrollment.entity';
import { Instructor } from './instructor.entity';
import { Lesson } from './lesson.entity';
import { Progress } from './progress.entity';
import { Section } from './section.entity';
import { User } from './user.entity';

export const entities = [
  BaseEntity,
  User,
  Instructor,
  Course,
  Section,
  Lesson,
  Enrollment,
  CourseReview,
  Progress,
];

export {
  BaseEntity,
  User,
  Instructor,
  Course,
  Section,
  Lesson,
  Enrollment,
  CourseReview,
  Progress,
};
