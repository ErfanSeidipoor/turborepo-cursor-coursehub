import {
  CustomError,
  COURSE_REVIEW_USER_ID_REQUIRED,
  COURSE_REVIEW_COURSE_ID_REQUIRED,
  COURSE_REVIEW_RATING_REQUIRED,
  COURSE_REVIEW_USER_NOT_FOUND,
  COURSE_REVIEW_COURSE_NOT_FOUND,
  COURSE_REVIEW_NO_ENROLLMENT,
  COURSE_REVIEW_ALREADY_EXISTS,
  COURSE_REVIEW_INVALID_RATING,
} from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { ReviewFeedbackService } from '../../review-feedback.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { LearningProgressService } from '../../learning-progress.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

describe('ReviewFeedbackService - createCourseReview', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should create a new course review with valid input', async () => {
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

    const rating = 5;
    const reviewText = faker.lorem.paragraph();

    const actualResult = await reviewFeedbackService.createCourseReview({
      userId: studentUser.id,
      courseId: course.id,
      rating,
      reviewText,
    });

    expect(actualResult.userId).toBe(studentUser.id);
    expect(actualResult.courseId).toBe(course.id);
    expect(actualResult.rating).toBe(rating);
    expect(actualResult.reviewText).toBe(reviewText);
    expect(actualResult.id).toBeDefined();
  });

  it('should throw COURSE_REVIEW_USER_ID_REQUIRED when userId is not provided', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);

    await expect(
      reviewFeedbackService.createCourseReview({
        userId: '',
        courseId: faker.string.uuid(),
        rating: 5,
      }),
    ).rejects.toThrow(new CustomError(COURSE_REVIEW_USER_ID_REQUIRED));
  });

  it('should throw COURSE_REVIEW_COURSE_ID_REQUIRED when courseId is not provided', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);

    await expect(
      reviewFeedbackService.createCourseReview({
        userId: faker.string.uuid(),
        courseId: '',
        rating: 5,
      }),
    ).rejects.toThrow(new CustomError(COURSE_REVIEW_COURSE_ID_REQUIRED));
  });

  it('should throw COURSE_REVIEW_RATING_REQUIRED when rating is not provided', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);

    await expect(
      reviewFeedbackService.createCourseReview({
        userId: faker.string.uuid(),
        courseId: faker.string.uuid(),
        rating: undefined as any,
      }),
    ).rejects.toThrow(new CustomError(COURSE_REVIEW_RATING_REQUIRED));
  });

  it('should throw COURSE_REVIEW_INVALID_RATING when rating is less than 1', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);

    await expect(
      reviewFeedbackService.createCourseReview({
        userId: faker.string.uuid(),
        courseId: faker.string.uuid(),
        rating: 0,
      }),
    ).rejects.toThrow(new CustomError(COURSE_REVIEW_INVALID_RATING));
  });

  it('should throw COURSE_REVIEW_INVALID_RATING when rating is greater than 5', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);

    await expect(
      reviewFeedbackService.createCourseReview({
        userId: faker.string.uuid(),
        courseId: faker.string.uuid(),
        rating: 6,
      }),
    ).rejects.toThrow(new CustomError(COURSE_REVIEW_INVALID_RATING));
  });

  it('should throw COURSE_REVIEW_INVALID_RATING when rating is not an integer', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);

    await expect(
      reviewFeedbackService.createCourseReview({
        userId: faker.string.uuid(),
        courseId: faker.string.uuid(),
        rating: 3.5,
      }),
    ).rejects.toThrow(new CustomError(COURSE_REVIEW_INVALID_RATING));
  });

  it('should throw COURSE_REVIEW_USER_NOT_FOUND when user does not exist', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);

    await expect(
      reviewFeedbackService.createCourseReview({
        userId: faker.string.uuid(),
        courseId: faker.string.uuid(),
        rating: 5,
      }),
    ).rejects.toThrow(new CustomError(COURSE_REVIEW_USER_NOT_FOUND));
  });

  it('should throw COURSE_REVIEW_COURSE_NOT_FOUND when course does not exist', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    await expect(
      reviewFeedbackService.createCourseReview({
        userId: user.id,
        courseId: faker.string.uuid(),
        rating: 5,
      }),
    ).rejects.toThrow(new CustomError(COURSE_REVIEW_COURSE_NOT_FOUND));
  });

  it('should throw COURSE_REVIEW_NO_ENROLLMENT when user is not enrolled in course', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);
    const userService = TestManager.getHandler(UserService);
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
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

    await expect(
      reviewFeedbackService.createCourseReview({
        userId: studentUser.id,
        courseId: course.id,
        rating: 5,
      }),
    ).rejects.toThrow(new CustomError(COURSE_REVIEW_NO_ENROLLMENT));
  });

  it('should throw COURSE_REVIEW_ALREADY_EXISTS when user has already reviewed the course', async () => {
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

  it('should create a course review without review text', async () => {
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

    const actualResult = await reviewFeedbackService.createCourseReview({
      userId: studentUser.id,
      courseId: course.id,
      rating: 5,
    });

    expect(actualResult.reviewText).toBeNull();
  });
});
