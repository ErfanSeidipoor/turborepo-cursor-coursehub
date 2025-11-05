import { CustomError, COURSE_REVIEW_NOT_FOUND } from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { ReviewFeedbackService } from '../../review-feedback.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { LearningProgressService } from '../../learning-progress.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

describe('ReviewFeedbackService - deleteCourseReview', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should delete a course review', async () => {
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

    await reviewFeedbackService.deleteCourseReview({
      reviewId: review.id,
    });

    const deletedReview = await reviewFeedbackService.findCourseReviewById({
      reviewId: review.id,
      returnError: false,
    });

    expect(deletedReview).toBeNull();
  });

  it('should throw COURSE_REVIEW_NOT_FOUND when review does not exist', async () => {
    const reviewFeedbackService = TestManager.getHandler(ReviewFeedbackService);

    await expect(
      reviewFeedbackService.deleteCourseReview({
        reviewId: faker.string.uuid(),
      }),
    ).rejects.toThrow(new CustomError(COURSE_REVIEW_NOT_FOUND));
  });
});

