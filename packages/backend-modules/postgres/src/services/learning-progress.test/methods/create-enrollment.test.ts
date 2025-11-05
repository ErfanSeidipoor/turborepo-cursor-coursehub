import {
  CustomError,
  ENROLLMENT_USER_ID_REQUIRED,
  ENROLLMENT_COURSE_ID_REQUIRED,
  ENROLLMENT_USER_NOT_FOUND,
  ENROLLMENT_COURSE_NOT_FOUND,
  ENROLLMENT_ALREADY_EXISTS,
} from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { LearningProgressService } from '../../learning-progress.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

describe('LearningProgressService - createEnrollment', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should create a new enrollment with valid user and course', async () => {
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

  it('should throw ENROLLMENT_USER_ID_REQUIRED when userId is missing', async () => {
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

    await expect(
      learningProgressService.createEnrollment({
        userId: '',
        courseId: course.id,
      }),
    ).rejects.toThrow(new CustomError(ENROLLMENT_USER_ID_REQUIRED));
  });

  it('should throw ENROLLMENT_COURSE_ID_REQUIRED when courseId is missing', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    await expect(
      learningProgressService.createEnrollment({
        userId: user.id,
        courseId: '',
      }),
    ).rejects.toThrow(new CustomError(ENROLLMENT_COURSE_ID_REQUIRED));
  });

  it('should throw ENROLLMENT_USER_NOT_FOUND when user does not exist', async () => {
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

    const nonExistentUserId = faker.string.uuid();

    await expect(
      learningProgressService.createEnrollment({
        userId: nonExistentUserId,
        courseId: course.id,
      }),
    ).rejects.toThrow(new CustomError(ENROLLMENT_USER_NOT_FOUND));
  });

  it('should throw ENROLLMENT_COURSE_NOT_FOUND when course does not exist', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const nonExistentCourseId = faker.string.uuid();

    await expect(
      learningProgressService.createEnrollment({
        userId: user.id,
        courseId: nonExistentCourseId,
      }),
    ).rejects.toThrow(new CustomError(ENROLLMENT_COURSE_NOT_FOUND));
  });

  it('should throw ENROLLMENT_ALREADY_EXISTS when user is already enrolled', async () => {
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
});
