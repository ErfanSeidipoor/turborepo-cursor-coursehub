import {
  CustomError,
  COURSE_REVIEW_ALREADY_EXISTS,
} from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { ReviewFeedbackService } from '../../review-feedback.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { LearningProgressService } from '../../learning-progress.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

/**
 * DOMAIN RULE 02: Only one review record is permitted per user per course.
 *
 * This test suite verifies that the ReviewFeedbackService enforces the constraint
 * that a user can only submit one review per course.
 */
describe('Domain Rule 02 - One Review Per User Per Course', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('02.1 - should prevent creating a second review for the same course by the same user', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);
    const userService = TestManager.getHandler(UserService);
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const instructorRepository = TestManager.getRepository(Instructor);
    const instructor = instructorRepository.create({
      userId: user.id,
      bio: faker.lorem.paragraph(),
    });
    await instructorRepository.save(instructor);

    const course = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.sentence(),
    });

    const studentUser = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    await learningProgressService.createEnrollment({
      userId: studentUser.id,
      courseId: course.id,
    });

    await reviewFeedbackService.createCourseReview({
      userId: studentUser.id,
      courseId: course.id,
      rating: 5,
    });

    await expect(
      reviewFeedbackService.createCourseReview({
        userId: studentUser.id,
        courseId: course.id,
        rating: 4,
      }),
    ).rejects.toThrow(new CustomError(COURSE_REVIEW_ALREADY_EXISTS));
  });

  it('02.2 - should allow different users to review the same course', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);
    const userService = TestManager.getHandler(UserService);
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const instructorRepository = TestManager.getRepository(Instructor);
    const instructor = instructorRepository.create({
      userId: user.id,
      bio: faker.lorem.paragraph(),
    });
    await instructorRepository.save(instructor);

    const course = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.sentence(),
    });

    const studentUser1 = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const studentUser2 = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    await learningProgressService.createEnrollment({
      userId: studentUser1.id,
      courseId: course.id,
    });

    await learningProgressService.createEnrollment({
      userId: studentUser2.id,
      courseId: course.id,
    });

    const review1 = await reviewFeedbackService.createCourseReview({
      userId: studentUser1.id,
      courseId: course.id,
      rating: 5,
    });

    const review2 = await reviewFeedbackService.createCourseReview({
      userId: studentUser2.id,
      courseId: course.id,
      rating: 4,
    });

    expect(review1.id).toBeDefined();
    expect(review2.id).toBeDefined();
    expect(review1.id).not.toBe(review2.id);
  });

  it('02.3 - should allow the same user to review different courses', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);
    const userService = TestManager.getHandler(UserService);
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const instructorRepository = TestManager.getRepository(Instructor);
    const instructor = instructorRepository.create({
      userId: user.id,
      bio: faker.lorem.paragraph(),
    });
    await instructorRepository.save(instructor);

    const course1 = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.sentence(),
    });

    const course2 = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.sentence(),
    });

    const studentUser = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    await learningProgressService.createEnrollment({
      userId: studentUser.id,
      courseId: course1.id,
    });

    await learningProgressService.createEnrollment({
      userId: studentUser.id,
      courseId: course2.id,
    });

    const review1 = await reviewFeedbackService.createCourseReview({
      userId: studentUser.id,
      courseId: course1.id,
      rating: 5,
    });

    const review2 = await reviewFeedbackService.createCourseReview({
      userId: studentUser.id,
      courseId: course2.id,
      rating: 4,
    });

    expect(review1.id).toBeDefined();
    expect(review2.id).toBeDefined();
    expect(review1.id).not.toBe(review2.id);
  });

  it('02.4 - should allow user to update their existing review instead of creating a new one', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);
    const userService = TestManager.getHandler(UserService);
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const instructorRepository = TestManager.getRepository(Instructor);
    const instructor = instructorRepository.create({
      userId: user.id,
      bio: faker.lorem.paragraph(),
    });
    await instructorRepository.save(instructor);

    const course = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.sentence(),
    });

    const studentUser = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    await learningProgressService.createEnrollment({
      userId: studentUser.id,
      courseId: course.id,
    });

    const review = await reviewFeedbackService.createCourseReview({
      userId: studentUser.id,
      courseId: course.id,
      rating: 3,
    });

    const updatedReview = await reviewFeedbackService.updateCourseReview({
      reviewId: review.id,
      rating: 5,
    });

    expect(updatedReview.id).toBe(review.id);
    expect(updatedReview.rating).toBe(5);
  });
});

