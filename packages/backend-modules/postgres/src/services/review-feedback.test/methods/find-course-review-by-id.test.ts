import { CustomError, COURSE_REVIEW_NOT_FOUND } from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { ReviewFeedbackService } from '../../review-feedback.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { LearningProgressService } from '../../learning-progress.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

describe('ReviewFeedbackService - findCourseReviewById', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should find a course review by id', async () => {
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
      rating: 5,
      reviewText: faker.lorem.paragraph(),
    });

    const actualResult = await reviewFeedbackService.findCourseReviewById({
      reviewId: review.id,
    });

    expect(actualResult).toBeDefined();
    expect(actualResult?.id).toBe(review.id);
    expect(actualResult?.userId).toBe(studentUser.id);
    expect(actualResult?.courseId).toBe(course.id);
  });

  it('should return undefined when review is not found and returnError is false', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);

    const actualResult = await reviewFeedbackService.findCourseReviewById({
      reviewId: faker.string.uuid(),
      returnError: false,
    });

    expect(actualResult).toBeNull();
  });

  it('should throw COURSE_REVIEW_NOT_FOUND when review is not found and returnError is true', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);

    await expect(
      reviewFeedbackService.findCourseReviewById({
        reviewId: faker.string.uuid(),
        returnError: true,
      }),
    ).rejects.toThrow(new CustomError(COURSE_REVIEW_NOT_FOUND));
  });

  it('should return undefined when reviewId is empty and returnError is false', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);

    const actualResult = await reviewFeedbackService.findCourseReviewById({
      reviewId: '',
      returnError: false,
    });

    expect(actualResult).toBeUndefined();
  });

  it('should throw COURSE_REVIEW_NOT_FOUND when reviewId is empty and returnError is true', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);

    await expect(
      reviewFeedbackService.findCourseReviewById({
        reviewId: '',
        returnError: true,
      }),
    ).rejects.toThrow(new CustomError(COURSE_REVIEW_NOT_FOUND));
  });
});
