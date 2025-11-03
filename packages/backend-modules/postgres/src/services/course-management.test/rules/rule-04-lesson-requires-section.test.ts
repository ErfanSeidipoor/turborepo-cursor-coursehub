import { CustomError, LESSON_SECTION_NOT_FOUND } from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { CourseManagementService } from '../../course-management.service';
import { UserService } from '../../user.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

/**
 * DOMAIN RULE 4: Every Lesson must be linked to a valid, existing Section (section_id Foreign Key).
 *
 * This test suite verifies that lessons can only be created when linked to a valid section.
 */
describe('Domain Rule 4 - Lesson Requires Section', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('04.1 - should allow creating a lesson with a valid section', async () => {
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

    expect(actualResult).toBeDefined();
    expect(actualResult.sectionId).toBe(section.id);
  });

  it('04.2 - should prevent creating a lesson without a valid section', async () => {
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

  it('04.3 - should verify section exists before lesson creation', async () => {
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

    const lesson = await courseManagementService.createLesson({
      sectionId: section.id,
      title: faker.lorem.words(3),
    });

    const lessonWithSection = await courseManagementService.findLessonById({
      lessonId: lesson.id,
      relations: { section: true },
    });

    expect(lessonWithSection?.section).toBeDefined();
    expect(lessonWithSection?.section.id).toBe(section.id);
  });

  it('04.4 - should link lesson to the correct section', async () => {
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

    const section1 = await courseManagementService.createSection({
      courseId: course.id,
      title: faker.lorem.words(3),
    });

    const section2 = await courseManagementService.createSection({
      courseId: course.id,
      title: faker.lorem.words(3),
    });

    const lesson1 = await courseManagementService.createLesson({
      sectionId: section1.id,
      title: faker.lorem.words(3),
    });

    const lesson2 = await courseManagementService.createLesson({
      sectionId: section2.id,
      title: faker.lorem.words(3),
    });

    expect(lesson1.sectionId).toBe(section1.id);
    expect(lesson2.sectionId).toBe(section2.id);
    expect(lesson1.sectionId).not.toBe(lesson2.sectionId);
  });
});
