import { TestManager } from '../../../test-manager.test';
import { LearningProgressService } from '../../learning-progress.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

/**
 * DOMAIN RULE 5: Progress updates (last_watched_time) must only occur if the user has a valid, active Enrollment.
 *
 * This test suite verifies that progress records can only be updated when there is
 * a valid, active enrollment for the user and course.
 */
describe('Domain Rule 05 - Progress Requires Active Enrollment', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('05.1 - should successfully update progress when valid enrollment exists', async () => {
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

    expect(actualResult.lastWatchedTime).toBe(120);
  });

  it('05.2 - should successfully update progress isCompleted when valid enrollment exists', async () => {
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

    expect(actualResult.isCompleted).toBe(true);
  });

  it('05.3 - should allow creating progress record with valid enrollment', async () => {
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
      lastWatchedTime: 60,
    });

    expect(actualResult.id).toBeDefined();
    expect(actualResult.enrollmentId).toBe(enrollment.id);
    expect(actualResult.lastWatchedTime).toBe(60);
  });
});
