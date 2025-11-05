import {
  CustomError,
  PROGRESS_NOT_FOUND,
  PROGRESS_INVALID_LAST_WATCHED_TIME,
} from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { LearningProgressService } from '../../learning-progress.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

describe('LearningProgressService - updateProgress', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should update progress isCompleted status', async () => {
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

    const actualResult = await learningProgressService.updateProgress({
      progressId: progress.id,
      isCompleted: true,
    });

    expect(actualResult.id).toBe(progress.id);
    expect(actualResult.isCompleted).toBe(true);
  });

  it('should update progress lastWatchedTime', async () => {
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

    const actualResult = await learningProgressService.updateProgress({
      progressId: progress.id,
      lastWatchedTime: 120,
    });

    expect(actualResult.id).toBe(progress.id);
    expect(actualResult.lastWatchedTime).toBe(120);
  });

  it('should throw PROGRESS_NOT_FOUND when progress does not exist', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const nonExistentId = faker.string.uuid();

    await expect(
      learningProgressService.updateProgress({
        progressId: nonExistentId,
        isCompleted: true,
      }),
    ).rejects.toThrow(new CustomError(PROGRESS_NOT_FOUND));
  });

  it('should throw PROGRESS_INVALID_LAST_WATCHED_TIME when lastWatchedTime is negative', async () => {
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

    await expect(
      learningProgressService.updateProgress({
        progressId: progress.id,
        lastWatchedTime: -1,
      }),
    ).rejects.toThrow(new CustomError(PROGRESS_INVALID_LAST_WATCHED_TIME));
  });

  it('should not update when values are unchanged', async () => {
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

    const actualResult = await learningProgressService.updateProgress({
      progressId: progress.id,
      isCompleted: false,
      lastWatchedTime: 0,
    });

    expect(actualResult.id).toBe(progress.id);
    expect(actualResult.isCompleted).toBe(false);
    expect(actualResult.lastWatchedTime).toBe(0);
  });
});
