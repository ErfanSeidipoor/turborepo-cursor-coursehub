import { TestManager } from '../../../test-manager.test';
import { CourseManagementService } from '../../course-management.service';
import { UserService } from '../../user.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';
import { CoursesStatusEnum } from '@repo/enums';

/**
 * DOMAIN RULE 2: A Course must transition through the workflow statuses (e.g., 'Draft' -> 'Review' -> 'Published'). Only 'Published' courses are visible to students.
 *
 * This test suite verifies that courses can transition through different status states.
 */
describe('Domain Rule 2 - Course Workflow Status', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('02.1 - should create a course with DRAFT status by default', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const userService = TestManager.getHandler(UserService);
    const instructorRepository = TestManager.getRepository(Instructor);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const instructor = instructorRepository.create({
      userId: user.id,
      bio: faker.lorem.paragraph(),
    });
    await instructorRepository.save(instructor);

    const actualResult = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.words(3),
    });

    expect(actualResult.status).toBe(CoursesStatusEnum.DRAFT);
  });

  it('02.2 - should allow transitioning from DRAFT to REVIEW', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const userService = TestManager.getHandler(UserService);
    const instructorRepository = TestManager.getRepository(Instructor);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const instructor = instructorRepository.create({
      userId: user.id,
      bio: faker.lorem.paragraph(),
    });
    await instructorRepository.save(instructor);

    const course = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.words(3),
      status: CoursesStatusEnum.DRAFT,
    });

    const actualResult = await courseManagementService.updateCourse({
      courseId: course.id,
      status: CoursesStatusEnum.REVIEW,
    });

    expect(actualResult.status).toBe(CoursesStatusEnum.REVIEW);
  });

  it('02.3 - should allow transitioning from REVIEW to PUBLISHED', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const userService = TestManager.getHandler(UserService);
    const instructorRepository = TestManager.getRepository(Instructor);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const instructor = instructorRepository.create({
      userId: user.id,
      bio: faker.lorem.paragraph(),
    });
    await instructorRepository.save(instructor);

    const course = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.words(3),
      status: CoursesStatusEnum.REVIEW,
    });

    const actualResult = await courseManagementService.updateCourse({
      courseId: course.id,
      status: CoursesStatusEnum.PUBLISHED,
    });

    expect(actualResult.status).toBe(CoursesStatusEnum.PUBLISHED);
  });

  it('02.4 - should allow transitioning from PUBLISHED to ARCHIVED', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const userService = TestManager.getHandler(UserService);
    const instructorRepository = TestManager.getRepository(Instructor);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const instructor = instructorRepository.create({
      userId: user.id,
      bio: faker.lorem.paragraph(),
    });
    await instructorRepository.save(instructor);

    const course = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.words(3),
      status: CoursesStatusEnum.PUBLISHED,
    });

    const actualResult = await courseManagementService.updateCourse({
      courseId: course.id,
      status: CoursesStatusEnum.ARCHIVED,
    });

    expect(actualResult.status).toBe(CoursesStatusEnum.ARCHIVED);
  });

  it('02.5 - should filter courses by PUBLISHED status', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const userService = TestManager.getHandler(UserService);
    const instructorRepository = TestManager.getRepository(Instructor);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const instructor = instructorRepository.create({
      userId: user.id,
      bio: faker.lorem.paragraph(),
    });
    await instructorRepository.save(instructor);

    await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.words(3),
      status: CoursesStatusEnum.DRAFT,
    });

    await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.words(3),
      status: CoursesStatusEnum.PUBLISHED,
    });

    await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.words(3),
      status: CoursesStatusEnum.PUBLISHED,
    });

    const actualResult = await courseManagementService.findCourses({
      status: CoursesStatusEnum.PUBLISHED,
    });

    expect(actualResult.items.length).toBe(2);
    expect(
      actualResult.items.every((c) => c.status === CoursesStatusEnum.PUBLISHED),
    ).toBe(true);
  });

  it('02.6 - should allow creating a course directly with PUBLISHED status', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const userService = TestManager.getHandler(UserService);
    const instructorRepository = TestManager.getRepository(Instructor);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const instructor = instructorRepository.create({
      userId: user.id,
      bio: faker.lorem.paragraph(),
    });
    await instructorRepository.save(instructor);

    const actualResult = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.words(3),
      status: CoursesStatusEnum.PUBLISHED,
    });

    expect(actualResult.status).toBe(CoursesStatusEnum.PUBLISHED);
  });
});
