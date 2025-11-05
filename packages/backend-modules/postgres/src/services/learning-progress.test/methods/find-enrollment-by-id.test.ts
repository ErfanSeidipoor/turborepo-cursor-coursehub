import { CustomError, ENROLLMENT_NOT_FOUND } from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { LearningProgressService } from '../../learning-progress.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

describe('LearningProgressService - findEnrollmentById', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should find enrollment by id', async () => {
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

    const actualResult = await learningProgressService.findEnrollmentById({
      enrollmentId: enrollment.id,
      returnError: false,
    });

    expect(actualResult).toBeDefined();
    expect(actualResult?.id).toBe(enrollment.id);
    expect(actualResult?.userId).toBe(user.id);
    expect(actualResult?.courseId).toBe(course.id);
  });

  it('should return undefined when enrollment does not exist and returnError is false', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const nonExistentId = faker.string.uuid();

    const actualResult = await learningProgressService.findEnrollmentById({
      enrollmentId: nonExistentId,
      returnError: false,
    });

    expect(actualResult).toBeUndefined();
  });

  it('should throw ENROLLMENT_NOT_FOUND when enrollment does not exist and returnError is true', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const nonExistentId = faker.string.uuid();

    await expect(
      learningProgressService.findEnrollmentById({
        enrollmentId: nonExistentId,
        returnError: true,
      }),
    ).rejects.toThrow(new CustomError(ENROLLMENT_NOT_FOUND));
  });

  it('should return undefined when enrollmentId is empty and returnError is false', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );

    const actualResult = await learningProgressService.findEnrollmentById({
      enrollmentId: '',
      returnError: false,
    });

    expect(actualResult).toBeUndefined();
  });

  it('should throw ENROLLMENT_NOT_FOUND when enrollmentId is empty and returnError is true', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );

    await expect(
      learningProgressService.findEnrollmentById({
        enrollmentId: '',
        returnError: true,
      }),
    ).rejects.toThrow(new CustomError(ENROLLMENT_NOT_FOUND));
  });
});
