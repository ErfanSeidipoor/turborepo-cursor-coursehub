import { TestManager } from '../../../test-manager.test';
import { CourseManagementService } from '../../course-management.service';
import { UserService } from '../../user.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';
import { CoursesStatusEnum, SortEnum } from '@repo/enums';

describe('CourseManagementService - findCourses', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should find courses with pagination', async () => {
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

    for (let i = 0; i < 15; i++) {
      await courseManagementService.createCourse({
        instructorId: instructor.id,
        title: faker.lorem.words(3),
      });
    }

    const actualResult = await courseManagementService.findCourses({
      page: 1,
      limit: 10,
    });

    expect(actualResult.items.length).toBe(10);
    expect(actualResult.meta?.totalItems).toBe(15);
    expect(actualResult.meta?.currentPage).toBe(1);
    expect(actualResult.meta?.totalPages).toBe(2);
  });

  it('should filter courses by instructorId', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const userService = TestManager.getHandler(UserService);
    const instructorRepository = TestManager.getRepository(Instructor);

    const user1 = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const user2 = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const instructor1 = instructorRepository.create({
      userId: user1.id,
      bio: faker.lorem.paragraph(),
    });
    await instructorRepository.save(instructor1);

    const instructor2 = instructorRepository.create({
      userId: user2.id,
      bio: faker.lorem.paragraph(),
    });
    await instructorRepository.save(instructor2);

    await courseManagementService.createCourse({
      instructorId: instructor1.id,
      title: faker.lorem.words(3),
    });

    await courseManagementService.createCourse({
      instructorId: instructor2.id,
      title: faker.lorem.words(3),
    });

    const actualResult = await courseManagementService.findCourses({
      instructorId: instructor1.id,
    });

    expect(actualResult.items.length).toBe(1);
    expect(actualResult.items[0]?.instructorId).toBe(instructor1.id);
  });

  it('should filter courses by status', async () => {
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

    const actualResult = await courseManagementService.findCourses({
      status: CoursesStatusEnum.PUBLISHED,
    });

    expect(actualResult.items.length).toBe(1);
    expect(actualResult.items[0]?.status).toBe(CoursesStatusEnum.PUBLISHED);
  });

  it('should filter courses by search term', async () => {
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
      title: 'JavaScript Programming',
    });

    await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: 'Python Programming',
    });

    const actualResult = await courseManagementService.findCourses({
      searchTerm: 'JavaScript',
    });

    expect(actualResult.items.length).toBe(1);
    expect(actualResult.items[0]?.title).toContain('JavaScript');
  });

  it('should sort courses by title ascending', async () => {
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
      title: 'Zebra Course',
    });

    await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: 'Alpha Course',
    });

    const actualResult = await courseManagementService.findCourses({
      sort: 'title',
      sortType: SortEnum.ASC,
    });

    expect(actualResult.items[0]?.title).toBe('Alpha Course');
    expect(actualResult.items[1]?.title).toBe('Zebra Course');
  });

  it('should sort courses by createdAt descending by default', async () => {
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

    const course1 = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: 'First Course',
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    const course2 = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: 'Second Course',
    });

    const actualResult = await courseManagementService.findCourses({});

    expect(actualResult.items[0]?.id).toBe(course2.id);
    expect(actualResult.items[1]?.id).toBe(course1.id);
  });

  it('should return empty list when no courses match criteria', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );

    const actualResult = await courseManagementService.findCourses({
      searchTerm: 'NonExistentCourse',
    });

    expect(actualResult.items.length).toBe(0);
    expect(actualResult.meta?.totalItems).toBe(0);
  });
});
