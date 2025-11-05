import { TestManager } from '../../../test-manager.test';
import { LearningProgressService } from '../../learning-progress.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

/**
 * DOMAIN RULE 1: An Enrollment is created directly upon the user taking an "Enroll Now" action for a course.
 *
 * This test suite verifies that enrollment records are created immediately when a user
 * enrolls in a course, with proper initial values.
 */
describe('Domain Rule 01 - Enrollment Created On Enroll Action', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('01.1 - should create enrollment immediately with default completion status of 0', async () => {
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

    const actualResult = await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course.id,
    });

    expect(actualResult.id).toBeDefined();
    expect(actualResult.userId).toBe(user.id);
    expect(actualResult.courseId).toBe(course.id);
    expect(Number(actualResult.completionStatus)).toBe(0);
    expect(actualResult.enrollmentDate).toBeInstanceOf(Date);
  });

  it('01.2 - should set enrollment date to current timestamp automatically', async () => {
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

    const beforeEnrollment = new Date();
    await new Promise((resolve) => setTimeout(resolve, 10));

    const actualResult = await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course.id,
    });

    await new Promise((resolve) => setTimeout(resolve, 10));
    const afterEnrollment = new Date();

    expect(actualResult.enrollmentDate.getTime()).toBeGreaterThanOrEqual(
      beforeEnrollment.getTime(),
    );
    expect(actualResult.enrollmentDate.getTime()).toBeLessThanOrEqual(
      afterEnrollment.getTime(),
    );
  });

  it('01.3 - should allow same user to enroll in different courses', async () => {
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

    const course1 = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
    });

    const course2 = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
    });

    const enrollment1 = await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course1.id,
    });

    const enrollment2 = await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course2.id,
    });

    expect(enrollment1.id).toBeDefined();
    expect(enrollment2.id).toBeDefined();
    expect(enrollment1.id).not.toBe(enrollment2.id);
    expect(enrollment1.courseId).toBe(course1.id);
    expect(enrollment2.courseId).toBe(course2.id);
  });

  it('01.4 - should allow different users to enroll in same course', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const userService = TestManager.getHandler(UserService);
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );

    const user1 = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const user2 = await userService.createUser({
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

    const enrollment1 = await learningProgressService.createEnrollment({
      userId: user1.id,
      courseId: course.id,
    });

    const enrollment2 = await learningProgressService.createEnrollment({
      userId: user2.id,
      courseId: course.id,
    });

    expect(enrollment1.id).toBeDefined();
    expect(enrollment2.id).toBeDefined();
    expect(enrollment1.id).not.toBe(enrollment2.id);
    expect(enrollment1.userId).toBe(user1.id);
    expect(enrollment2.userId).toBe(user2.id);
  });
});
