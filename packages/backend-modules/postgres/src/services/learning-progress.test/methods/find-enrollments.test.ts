import { TestManager } from '../../../test-manager.test';
import { LearningProgressService } from '../../learning-progress.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { SortEnum } from '@repo/enums';
import { faker } from '@faker-js/faker';

describe('LearningProgressService - findEnrollments', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should find all enrollments with pagination', async () => {
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

    await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course1.id,
    });

    await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course2.id,
    });

    const actualResult = await learningProgressService.findEnrollments({
      page: 1,
      limit: 10,
    });

    expect(actualResult.items.length).toBe(2);
    expect(actualResult.meta?.totalItems).toBe(2);
  });

  it('should filter enrollments by userId', async () => {
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

    await learningProgressService.createEnrollment({
      userId: user1.id,
      courseId: course.id,
    });

    await learningProgressService.createEnrollment({
      userId: user2.id,
      courseId: course.id,
    });

    const actualResult = await learningProgressService.findEnrollments({
      userId: user1.id,
    });

    expect(actualResult.items.length).toBe(1);
    expect(actualResult.items[0]?.userId).toBe(user1.id);
  });

  it('should filter enrollments by courseId', async () => {
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

    await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course1.id,
    });

    await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course2.id,
    });

    const actualResult = await learningProgressService.findEnrollments({
      courseId: course1.id,
    });

    expect(actualResult.items.length).toBe(1);
    expect(actualResult.items[0]?.courseId).toBe(course1.id);
  });

  it('should sort enrollments by specified field and sort type', async () => {
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

    await new Promise((resolve) => setTimeout(resolve, 10));

    const enrollment2 = await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course2.id,
    });

    const actualResult = await learningProgressService.findEnrollments({
      sort: 'createdAt',
      sortType: SortEnum.ASC,
    });

    expect(actualResult.items[0]?.id).toBe(enrollment1.id);
    expect(actualResult.items[1]?.id).toBe(enrollment2.id);
  });
});
