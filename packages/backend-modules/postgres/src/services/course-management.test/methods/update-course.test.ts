import {
  CustomError,
  COURSE_NOT_FOUND,
  COURSE_TITLE_EMPTY,
} from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { CourseManagementService } from '../../course-management.service';
import { UserService } from '../../user.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';
import { CoursesStatusEnum } from '@repo/enums';

describe('CourseManagementService - updateCourse', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should update course title', async () => {
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
    });

    const newTitle = faker.lorem.words(4);

    const actualResult = await courseManagementService.updateCourse({
      courseId: course.id,
      title: newTitle,
    });

    expect(actualResult.title).toBe(newTitle);
    expect(actualResult.id).toBe(course.id);
  });

  it('should update course description', async () => {
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
      description: faker.lorem.paragraph(),
    });

    const newDescription = faker.lorem.paragraph();

    const actualResult = await courseManagementService.updateCourse({
      courseId: course.id,
      description: newDescription,
    });

    expect(actualResult.description).toBe(newDescription);
  });

  it('should update course status', async () => {
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
      status: CoursesStatusEnum.PUBLISHED,
    });

    expect(actualResult.status).toBe(CoursesStatusEnum.PUBLISHED);
  });

  it('should update multiple fields at once', async () => {
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
    });

    const newTitle = faker.lorem.words(4);
    const newDescription = faker.lorem.paragraph();

    const actualResult = await courseManagementService.updateCourse({
      courseId: course.id,
      title: newTitle,
      description: newDescription,
      status: CoursesStatusEnum.REVIEW,
    });

    expect(actualResult.title).toBe(newTitle);
    expect(actualResult.description).toBe(newDescription);
    expect(actualResult.status).toBe(CoursesStatusEnum.REVIEW);
  });

  it('should throw COURSE_NOT_FOUND when course does not exist', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const fakeCourseId = faker.string.uuid();

    await expect(
      courseManagementService.updateCourse({
        courseId: fakeCourseId,
        title: faker.lorem.words(3),
      }),
    ).rejects.toThrow(new CustomError(COURSE_NOT_FOUND));
  });

  it('should throw COURSE_TITLE_EMPTY when title contains only whitespace', async () => {
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
    });

    await expect(
      courseManagementService.updateCourse({
        courseId: course.id,
        title: '   ',
      }),
    ).rejects.toThrow(new CustomError(COURSE_TITLE_EMPTY));
  });

  it('should trim title before updating', async () => {
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
    });

    const newTitle = faker.lorem.words(4);

    const actualResult = await courseManagementService.updateCourse({
      courseId: course.id,
      title: `  ${newTitle}  `,
    });

    expect(actualResult.title).toBe(newTitle);
  });

  it('should not update when no changes are provided', async () => {
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
    });

    const actualResult = await courseManagementService.updateCourse({
      courseId: course.id,
    });

    expect(actualResult.title).toBe(course.title);
    expect(actualResult.updatedAt.getTime()).toBeGreaterThanOrEqual(
      course.updatedAt.getTime(),
    );
  });
});
