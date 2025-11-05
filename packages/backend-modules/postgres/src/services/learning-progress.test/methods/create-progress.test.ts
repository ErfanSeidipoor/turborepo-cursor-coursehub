import {
  CustomError,
  PROGRESS_ENROLLMENT_ID_REQUIRED,
  PROGRESS_LESSON_ID_REQUIRED,
  PROGRESS_ENROLLMENT_NOT_FOUND,
  PROGRESS_LESSON_NOT_FOUND,
  PROGRESS_INVALID_LAST_WATCHED_TIME,
} from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { LearningProgressService } from '../../learning-progress.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

describe('LearningProgressService - createProgress', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should create a new progress with valid enrollment and lesson', async () => {
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

    const actualResult = await learningProgressService.createProgress({
      enrollmentId: enrollment.id,
      lessonId: lesson.id,
      isCompleted: false,
      lastWatchedTime: 0,
    });

    expect(actualResult.id).toBeDefined();
    expect(actualResult.enrollmentId).toBe(enrollment.id);
    expect(actualResult.lessonId).toBe(lesson.id);
    expect(actualResult.isCompleted).toBe(false);
    expect(actualResult.lastWatchedTime).toBe(0);
  });

  it('should throw PROGRESS_ENROLLMENT_ID_REQUIRED when enrollmentId is missing', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const userService = TestManager.getHandler(UserService);
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );

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

    await expect(
      learningProgressService.createProgress({
        enrollmentId: '',
        lessonId: lesson.id,
      }),
    ).rejects.toThrow(new CustomError(PROGRESS_ENROLLMENT_ID_REQUIRED));
  });

  it('should throw PROGRESS_LESSON_ID_REQUIRED when lessonId is missing', async () => {
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

    const enrollment = await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course.id,
    });

    await expect(
      learningProgressService.createProgress({
        enrollmentId: enrollment.id,
        lessonId: '',
      }),
    ).rejects.toThrow(new CustomError(PROGRESS_LESSON_ID_REQUIRED));
  });

  it('should throw PROGRESS_ENROLLMENT_NOT_FOUND when enrollment does not exist', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const userService = TestManager.getHandler(UserService);
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );

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

    const nonExistentEnrollmentId = faker.string.uuid();

    await expect(
      learningProgressService.createProgress({
        enrollmentId: nonExistentEnrollmentId,
        lessonId: lesson.id,
      }),
    ).rejects.toThrow(new CustomError(PROGRESS_ENROLLMENT_NOT_FOUND));
  });

  it('should throw PROGRESS_LESSON_NOT_FOUND when lesson does not exist', async () => {
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

    const enrollment = await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course.id,
    });

    const nonExistentLessonId = faker.string.uuid();

    await expect(
      learningProgressService.createProgress({
        enrollmentId: enrollment.id,
        lessonId: nonExistentLessonId,
      }),
    ).rejects.toThrow(new CustomError(PROGRESS_LESSON_NOT_FOUND));
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

    await expect(
      learningProgressService.createProgress({
        enrollmentId: enrollment.id,
        lessonId: lesson.id,
        lastWatchedTime: -1,
      }),
    ).rejects.toThrow(new CustomError(PROGRESS_INVALID_LAST_WATCHED_TIME));
  });

  it('should create progress with default values when optional fields are not provided', async () => {
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

    const actualResult = await learningProgressService.createProgress({
      enrollmentId: enrollment.id,
      lessonId: lesson.id,
    });

    expect(actualResult.isCompleted).toBe(false);
    expect(actualResult.lastWatchedTime).toBe(0);
  });
});
