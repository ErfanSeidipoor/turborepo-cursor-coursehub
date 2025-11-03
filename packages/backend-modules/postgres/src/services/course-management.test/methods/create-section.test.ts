import {
  CustomError,
  SECTION_COURSE_ID_REQUIRED,
  SECTION_TITLE_REQUIRED,
  SECTION_TITLE_EMPTY,
  SECTION_COURSE_NOT_FOUND,
} from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { CourseManagementService } from '../../course-management.service';
import { UserService } from '../../user.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

describe('CourseManagementService - createSection', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should create a new section with valid input', async () => {
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

    const title = faker.lorem.words(3);

    const actualResult = await courseManagementService.createSection({
      courseId: course.id,
      title,
    });

    expect(actualResult.title).toBe(title);
    expect(actualResult.courseId).toBe(course.id);
    expect(actualResult.orderIndex).toBe(0);
    expect(actualResult.id).toBeDefined();
    expect(actualResult.createdAt).toBeDefined();
    expect(actualResult.updatedAt).toBeDefined();
  });

  it('should create a section with custom orderIndex', async () => {
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

    const actualResult = await courseManagementService.createSection({
      courseId: course.id,
      title: faker.lorem.words(3),
      orderIndex: 5,
    });

    expect(actualResult.orderIndex).toBe(5);
  });

  it('should throw SECTION_COURSE_ID_REQUIRED when courseId is not provided', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );

    await expect(
      courseManagementService.createSection({
        courseId: '',
        title: faker.lorem.words(3),
      }),
    ).rejects.toThrow(new CustomError(SECTION_COURSE_ID_REQUIRED));
  });

  it('should throw SECTION_TITLE_REQUIRED when title is not provided', async () => {
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
      courseManagementService.createSection({
        courseId: course.id,
        title: '',
      }),
    ).rejects.toThrow(new CustomError(SECTION_TITLE_REQUIRED));
  });

  it('should throw SECTION_TITLE_EMPTY when title contains only whitespace', async () => {
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
      courseManagementService.createSection({
        courseId: course.id,
        title: '   ',
      }),
    ).rejects.toThrow(new CustomError(SECTION_TITLE_EMPTY));
  });

  it('should throw SECTION_COURSE_NOT_FOUND when course does not exist', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const fakeCourseId = faker.string.uuid();

    await expect(
      courseManagementService.createSection({
        courseId: fakeCourseId,
        title: faker.lorem.words(3),
      }),
    ).rejects.toThrow(new CustomError(SECTION_COURSE_NOT_FOUND));
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

    const course = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.words(3),
    });

    const title = faker.lorem.words(3);

    const actualResult = await courseManagementService.createSection({
      courseId: course.id,
      title: `  ${title}  `,
    });

    expect(actualResult.title).toBe(title);
  });
});
