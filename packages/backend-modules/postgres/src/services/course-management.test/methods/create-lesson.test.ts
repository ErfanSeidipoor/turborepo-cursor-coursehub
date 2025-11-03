import {
  CustomError,
  LESSON_SECTION_ID_REQUIRED,
  LESSON_TITLE_REQUIRED,
  LESSON_TITLE_EMPTY,
  LESSON_SECTION_NOT_FOUND,
} from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { CourseManagementService } from '../../course-management.service';
import { UserService } from '../../user.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

describe('CourseManagementService - createLesson', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should create a new lesson with valid input', async () => {
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

    const section = await courseManagementService.createSection({
      courseId: course.id,
      title: faker.lorem.words(3),
    });

    const title = faker.lorem.words(3);
    const contentUrl = faker.internet.url();

    const actualResult = await courseManagementService.createLesson({
      sectionId: section.id,
      title,
      contentUrl,
    });

    expect(actualResult.title).toBe(title);
    expect(actualResult.contentUrl).toBe(contentUrl);
    expect(actualResult.sectionId).toBe(section.id);
    expect(actualResult.id).toBeDefined();
    expect(actualResult.createdAt).toBeDefined();
    expect(actualResult.updatedAt).toBeDefined();
  });

  it('should create a lesson without contentUrl', async () => {
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

    const section = await courseManagementService.createSection({
      courseId: course.id,
      title: faker.lorem.words(3),
    });

    const actualResult = await courseManagementService.createLesson({
      sectionId: section.id,
      title: faker.lorem.words(3),
    });

    expect(actualResult.contentUrl).toBeNull();
  });

  it('should throw LESSON_SECTION_ID_REQUIRED when sectionId is not provided', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );

    await expect(
      courseManagementService.createLesson({
        sectionId: '',
        title: faker.lorem.words(3),
      }),
    ).rejects.toThrow(new CustomError(LESSON_SECTION_ID_REQUIRED));
  });

  it('should throw LESSON_TITLE_REQUIRED when title is not provided', async () => {
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

    const section = await courseManagementService.createSection({
      courseId: course.id,
      title: faker.lorem.words(3),
    });

    await expect(
      courseManagementService.createLesson({
        sectionId: section.id,
        title: '',
      }),
    ).rejects.toThrow(new CustomError(LESSON_TITLE_REQUIRED));
  });

  it('should throw LESSON_TITLE_EMPTY when title contains only whitespace', async () => {
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

    const section = await courseManagementService.createSection({
      courseId: course.id,
      title: faker.lorem.words(3),
    });

    await expect(
      courseManagementService.createLesson({
        sectionId: section.id,
        title: '   ',
      }),
    ).rejects.toThrow(new CustomError(LESSON_TITLE_EMPTY));
  });

  it('should throw LESSON_SECTION_NOT_FOUND when section does not exist', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const fakeSectionId = faker.string.uuid();

    await expect(
      courseManagementService.createLesson({
        sectionId: fakeSectionId,
        title: faker.lorem.words(3),
      }),
    ).rejects.toThrow(new CustomError(LESSON_SECTION_NOT_FOUND));
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

    const section = await courseManagementService.createSection({
      courseId: course.id,
      title: faker.lorem.words(3),
    });

    const title = faker.lorem.words(3);

    const actualResult = await courseManagementService.createLesson({
      sectionId: section.id,
      title: `  ${title}  `,
    });

    expect(actualResult.title).toBe(title);
  });

  it('should trim contentUrl before saving', async () => {
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

    const section = await courseManagementService.createSection({
      courseId: course.id,
      title: faker.lorem.words(3),
    });

    const contentUrl = faker.internet.url();

    const actualResult = await courseManagementService.createLesson({
      sectionId: section.id,
      title: faker.lorem.words(3),
      contentUrl: `  ${contentUrl}  `,
    });

    expect(actualResult.contentUrl).toBe(contentUrl);
  });
});
