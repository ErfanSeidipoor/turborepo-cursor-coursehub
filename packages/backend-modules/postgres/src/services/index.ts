import { UserService } from './user.service';
import { CourseManagementService } from './course-management.service';
import { LearningProgressService } from './learning-progress.service';

export const services = [
  UserService,
  CourseManagementService,
  LearningProgressService,
];

export { UserService, CourseManagementService, LearningProgressService };
