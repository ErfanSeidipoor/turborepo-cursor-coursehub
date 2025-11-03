import { BaseEntity } from './base.entity';
import { Course } from './course.entity';
import { Instructor } from './instructor.entity';
import { Lesson } from './lesson.entity';
import { Section } from './section.entity';
import { User } from './user.entity';

export const entities = [BaseEntity, User, Instructor, Course, Section, Lesson];

export { BaseEntity, User, Instructor, Course, Section, Lesson };
