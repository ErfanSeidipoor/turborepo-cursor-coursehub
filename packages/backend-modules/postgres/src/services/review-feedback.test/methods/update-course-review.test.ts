import {
  CustomError,
  COURSE_REVIEW_NOT_FOUND,
  COURSE_REVIEW_INVALID_RATING,
} from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { ReviewFeedbackService } from '../../review-feedback.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { LearningProgressService } from '../../learning-progress.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

describe('ReviewFeedbackService - updateCourseReview', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should update a course review rating', async () => {
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
      reviewText: faker.lorem.paragraph(),
    });

    const newRating = 5;

    const actualResult = await reviewFeedbackService.updateCourseReview({
      reviewId: review.id,
      rating: newRating,
    });

    expect(actualResult.rating).toBe(newRating);
    expect(actualResult.id).toBe(review.id);
  });

  it('should update a course review text', async () => {
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

    const newReviewText = 'Updated review text';

    const actualResult = await reviewFeedbackService.updateCourseReview({
      reviewId: review.id,
      reviewText: newReviewText,
    });

    expect(actualResult.reviewText).toBe(newReviewText);
    expect(actualResult.id).toBe(review.id);
  });

  it('should update both rating and review text', async () => {
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
      reviewText: faker.lorem.paragraph(),
    });

    const newRating = 5;
    const newReviewText = 'Updated review text';

    const actualResult = await reviewFeedbackService.updateCourseReview({
      reviewId: review.id,
      rating: newRating,
      reviewText: newReviewText,
    });

    expect(actualResult.rating).toBe(newRating);
    expect(actualResult.reviewText).toBe(newReviewText);
  });

  it('should throw COURSE_REVIEW_NOT_FOUND when review does not exist', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);

    await expect(
      reviewFeedbackService.updateCourseReview({
        reviewId: faker.string.uuid(),
        rating: 5,
      }),
    ).rejects.toThrow(new CustomError(COURSE_REVIEW_NOT_FOUND));
  });

  it('should throw COURSE_REVIEW_INVALID_RATING when rating is less than 1', async () => {
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
    });

    await expect(
      reviewFeedbackService.updateCourseReview({
        reviewId: review.id,
        rating: 0,
      }),
    ).rejects.toThrow(new CustomError(COURSE_REVIEW_INVALID_RATING));
  });

  it('should throw COURSE_REVIEW_INVALID_RATING when rating is greater than 5', async () => {
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
    });

    await expect(
      reviewFeedbackService.updateCourseReview({
        reviewId: review.id,
        rating: 6,
      }),
    ).rejects.toThrow(new CustomError(COURSE_REVIEW_INVALID_RATING));
  });

  it('should throw COURSE_REVIEW_INVALID_RATING when rating is not an integer', async () => {
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
    });

    await expect(
      reviewFeedbackService.updateCourseReview({
        reviewId: review.id,
        rating: 3.5,
      }),
    ).rejects.toThrow(new CustomError(COURSE_REVIEW_INVALID_RATING));
  });

  it('should set review text to null when empty string is provided', async () => {
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

    const actualResult = await reviewFeedbackService.updateCourseReview({
      reviewId: review.id,
      reviewText: '',
    });

    expect(actualResult.reviewText).toBeNull();
  });
});

