import {
  CustomError,
  ENROLLMENT_NOT_FOUND,
  ENROLLMENT_INVALID_COMPLETION_STATUS,
} from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { LearningProgressService } from '../../learning-progress.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

describe('LearningProgressService - updateEnrollment', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should update enrollment completion status', async () => {
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

    const actualResult = await learningProgressService.updateEnrollment({
      enrollmentId: enrollment.id,
      completionStatus: 50,
    });

    expect(actualResult.id).toBe(enrollment.id);
    expect(Number(actualResult.completionStatus)).toBe(50);
  });

  it('should throw ENROLLMENT_NOT_FOUND when enrollment does not exist', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const nonExistentId = faker.string.uuid();

    await expect(
      learningProgressService.updateEnrollment({
        enrollmentId: nonExistentId,
        completionStatus: 50,
      }),
    ).rejects.toThrow(new CustomError(ENROLLMENT_NOT_FOUND));
  });

  it('should throw ENROLLMENT_INVALID_COMPLETION_STATUS when completion status is negative', async () => {
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
      learningProgressService.updateEnrollment({
        enrollmentId: enrollment.id,
        completionStatus: -1,
      }),
    ).rejects.toThrow(new CustomError(ENROLLMENT_INVALID_COMPLETION_STATUS));
  });

  it('should throw ENROLLMENT_INVALID_COMPLETION_STATUS when completion status exceeds 100', async () => {
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
      learningProgressService.updateEnrollment({
        enrollmentId: enrollment.id,
        completionStatus: 101,
      }),
    ).rejects.toThrow(new CustomError(ENROLLMENT_INVALID_COMPLETION_STATUS));
  });

  it('should not update when completion status is unchanged', async () => {
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

    const actualResult = await learningProgressService.updateEnrollment({
      enrollmentId: enrollment.id,
      completionStatus: 0,
    });

    expect(actualResult.id).toBe(enrollment.id);
    expect(Number(actualResult.completionStatus)).toBe(0);
  });
});
