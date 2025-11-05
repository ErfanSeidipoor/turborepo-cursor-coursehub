import { CustomError, ENROLLMENT_ALREADY_EXISTS } from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { LearningProgressService } from '../../learning-progress.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

/**
 * DOMAIN RULE 2: A student can only view the content of a Course if an active Enrollment record exists for that user and course.
 *
 * This test suite verifies that enrollment records enforce access control by preventing
 * duplicate enrollments and ensuring only enrolled users can access course content.
 */
describe('Domain Rule 02 - Enrollment Required For Content Access', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('02.1 - should prevent duplicate enrollment for same user and course', async () => {
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

    await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course.id,
    });

    await expect(
      learningProgressService.createEnrollment({
        userId: user.id,
        courseId: course.id,
      }),
    ).rejects.toThrow(new CustomError(ENROLLMENT_ALREADY_EXISTS));
  });

  it('02.2 - should allow finding enrollment to verify access rights', async () => {
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

    const actualResult = await learningProgressService.findEnrollments({
      userId: user.id,
      courseId: course.id,
    });

    expect(actualResult.items.length).toBe(1);
    expect(actualResult.items[0]?.id).toBe(enrollment.id);
    expect(actualResult.items[0]?.userId).toBe(user.id);
    expect(actualResult.items[0]?.courseId).toBe(course.id);
  });

  it('02.3 - should return empty result when user is not enrolled in course', async () => {
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

    const actualResult = await learningProgressService.findEnrollments({
      userId: user.id,
      courseId: course.id,
    });

    expect(actualResult.items.length).toBe(0);
  });

  it('02.4 - should track enrollment status through deletedAt for access control', async () => {
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

    await learningProgressService.deleteEnrollment({
      enrollmentId: enrollment.id,
    });

    const actualResult = await learningProgressService.findEnrollments({
      userId: user.id,
      courseId: course.id,
    });

    expect(actualResult.items.length).toBe(0);
  });
});
