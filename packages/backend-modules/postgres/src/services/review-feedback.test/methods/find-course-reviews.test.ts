import { TestManager } from '../../../test-manager.test';
import { ReviewFeedbackService } from '../../review-feedback.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { LearningProgressService } from '../../learning-progress.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

describe('ReviewFeedbackService - findCourseReviews', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should find all course reviews', async () => {
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

    await reviewFeedbackService.createCourseReview({
      userId: studentUser1.id,
      courseId: course.id,
      rating: 5,
    });

    await reviewFeedbackService.createCourseReview({
      userId: studentUser2.id,
      courseId: course.id,
      rating: 4,
    });

    const actualResult = await reviewFeedbackService.findCourseReviews();

    expect(actualResult.items.length).toBeGreaterThanOrEqual(2);
  });

  it('should filter reviews by userId', async () => {
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

    await reviewFeedbackService.createCourseReview({
      userId: studentUser1.id,
      courseId: course.id,
      rating: 5,
    });

    await reviewFeedbackService.createCourseReview({
      userId: studentUser2.id,
      courseId: course.id,
      rating: 4,
    });

    const actualResult = await reviewFeedbackService.findCourseReviews({
      userId: studentUser1.id,
    });

    expect(actualResult.items.length).toBeGreaterThanOrEqual(1);
    actualResult.items.forEach((review) => {
      expect(review.userId).toBe(studentUser1.id);
    });
  });

  it('should filter reviews by courseId', async () => {
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

    await reviewFeedbackService.createCourseReview({
      userId: studentUser.id,
      courseId: course1.id,
      rating: 5,
    });

    await reviewFeedbackService.createCourseReview({
      userId: studentUser.id,
      courseId: course2.id,
      rating: 4,
    });

    const actualResult = await reviewFeedbackService.findCourseReviews({
      courseId: course1.id,
    });

    expect(actualResult.items.length).toBeGreaterThanOrEqual(1);
    actualResult.items.forEach((review) => {
      expect(review.courseId).toBe(course1.id);
    });
  });

  it('should filter reviews by minRating', async () => {
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

    await reviewFeedbackService.createCourseReview({
      userId: studentUser1.id,
      courseId: course.id,
      rating: 5,
    });

    await reviewFeedbackService.createCourseReview({
      userId: studentUser2.id,
      courseId: course.id,
      rating: 2,
    });

    const actualResult = await reviewFeedbackService.findCourseReviews({
      minRating: 4,
    });

    actualResult.items.forEach((review) => {
      expect(review.rating).toBeGreaterThanOrEqual(4);
    });
  });

  it('should filter reviews by maxRating', async () => {
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

    await reviewFeedbackService.createCourseReview({
      userId: studentUser1.id,
      courseId: course.id,
      rating: 5,
    });

    await reviewFeedbackService.createCourseReview({
      userId: studentUser2.id,
      courseId: course.id,
      rating: 2,
    });

    const actualResult = await reviewFeedbackService.findCourseReviews({
      maxRating: 3,
    });

    actualResult.items.forEach((review) => {
      expect(review.rating).toBeLessThanOrEqual(3);
    });
  });
});
