import { CustomError, PROGRESS_NOT_FOUND } from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { LearningProgressService } from '../../learning-progress.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

describe('LearningProgressService - findProgressById', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should find progress by id', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const userService = TestManager.getHandler(UserService);
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const instructorUser = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const instructorRepository = TestManager.getRepository(Instructor);
    const instructor = instructorRepository.create({
      userId: instructorUser.id,
      bio: faker.lorem.paragraph(),
    });
    await instructorRepository.save(instructor);

    const course = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
    });

    const section = await courseManagementService.createSection({
      courseId: course.id,
      title: faker.lorem.sentence(),
    });

    const lesson = await courseManagementService.createLesson({
      sectionId: section.id,
      title: faker.lorem.sentence(),
      contentUrl: faker.internet.url(),
    });

    const enrollment = await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course.id,
    });

    const progress = await learningProgressService.createProgress({
      enrollmentId: enrollment.id,
      lessonId: lesson.id,
    });

    const actualResult = await learningProgressService.findProgressById({
      progressId: progress.id,
      returnError: false,
    });

    expect(actualResult).toBeDefined();
    expect(actualResult?.id).toBe(progress.id);
    expect(actualResult?.enrollmentId).toBe(enrollment.id);
    expect(actualResult?.lessonId).toBe(lesson.id);
  });

  it('should return undefined when progress does not exist and returnError is false', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const nonExistentId = faker.string.uuid();

    const actualResult = await learningProgressService.findProgressById({
      progressId: nonExistentId,
      returnError: false,
    });

    expect(actualResult).toBeUndefined();
  });

  it('should throw PROGRESS_NOT_FOUND when progress does not exist and returnError is true', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const nonExistentId = faker.string.uuid();

    await expect(
      learningProgressService.findProgressById({
        progressId: nonExistentId,
        returnError: true,
      }),
    ).rejects.toThrow(new CustomError(PROGRESS_NOT_FOUND));
  });

  it('should return undefined when progressId is empty and returnError is false', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );

    const actualResult = await learningProgressService.findProgressById({
      progressId: '',
      returnError: false,
    });

    expect(actualResult).toBeUndefined();
  });

  it('should throw PROGRESS_NOT_FOUND when progressId is empty and returnError is true', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );

    await expect(
      learningProgressService.findProgressById({
        progressId: '',
        returnError: true,
      }),
    ).rejects.toThrow(new CustomError(PROGRESS_NOT_FOUND));
  });
});
