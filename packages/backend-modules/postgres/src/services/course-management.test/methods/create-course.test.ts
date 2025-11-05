import {
  CustomError,
  COURSE_INSTRUCTOR_ID_REQUIRED,
  COURSE_TITLE_REQUIRED,
  COURSE_TITLE_EMPTY,
  COURSE_INSTRUCTOR_NOT_FOUND,
} from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { CourseManagementService } from '../../course-management.service';
import { UserService } from '../../user.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';
import { CoursesStatusEnum } from '@repo/enums';

describe('CourseManagementService - createCourse', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should create a new course with valid input', async () => {
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

    const title = faker.lorem.words(3);
    const description = faker.lorem.paragraph();

    const actualResult = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title,
      description,
    });

    expect(actualResult.title).toBe(title);
    expect(actualResult.description).toBe(description);
    expect(actualResult.instructorId).toBe(instructor.id);
    expect(actualResult.status).toBe(CoursesStatusEnum.DRAFT);
    expect(actualResult.id).toBeDefined();
    expect(actualResult.createdAt).toBeDefined();
    expect(actualResult.updatedAt).toBeDefined();
  });

  it('should create a course with custom status', async () => {
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

  it('should throw COURSE_INSTRUCTOR_ID_REQUIRED when instructorId is not provided', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );

    await expect(
      courseManagementService.createCourse({
        instructorId: '',
        title: faker.lorem.words(3),
      }),
    ).rejects.toThrow(new CustomError(COURSE_INSTRUCTOR_ID_REQUIRED));
  });

  it('should throw COURSE_TITLE_REQUIRED when title is not provided', async () => {
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

    await expect(
      courseManagementService.createCourse({
        instructorId: instructor.id,
        title: '',
      }),
    ).rejects.toThrow(new CustomError(COURSE_TITLE_REQUIRED));
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

    await expect(
      courseManagementService.createCourse({
        instructorId: instructor.id,
        title: '   ',
      }),
    ).rejects.toThrow(new CustomError(COURSE_TITLE_EMPTY));
  });

  it('should throw COURSE_INSTRUCTOR_NOT_FOUND when instructor does not exist', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const fakeInstructorId = faker.string.uuid();

    await expect(
      courseManagementService.createCourse({
        instructorId: fakeInstructorId,
        title: faker.lorem.words(3),
      }),
    ).rejects.toThrow(new CustomError(COURSE_INSTRUCTOR_NOT_FOUND));
  });

  it('should trim title before saving', async () => {
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

    const title = faker.lorem.words(3);

    const actualResult = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: `  ${title}  `,
    });

    expect(actualResult.title).toBe(title);
  });

  it('should trim description before saving', async () => {
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

    const description = faker.lorem.paragraph();

    const actualResult = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.words(3),
      description: `  ${description}  `,
    });

    expect(actualResult.description).toBe(description);
  });

  it('should create a course without description', async () => {
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

    expect(actualResult.description).toBeNull();
  });
});
