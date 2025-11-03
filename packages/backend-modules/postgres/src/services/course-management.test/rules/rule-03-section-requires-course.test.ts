import { CustomError, SECTION_COURSE_NOT_FOUND } from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { CourseManagementService } from '../../course-management.service';
import { UserService } from '../../user.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

/**
 * DOMAIN RULE 3: Every Section must be linked to a valid, existing Course (course_id Foreign Key).
 *
 * This test suite verifies that sections can only be created when linked to a valid course.
 */
describe('Domain Rule 3 - Section Requires Course', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('03.1 - should allow creating a section with a valid course', async () => {
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
    });

    expect(actualResult).toBeDefined();
    expect(actualResult.courseId).toBe(course.id);
  });

  it('03.2 - should prevent creating a section without a valid course', async () => {
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

  it('03.3 - should verify course exists before section creation', async () => {
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

    const sectionWithCourse = await courseManagementService.findSectionById({
      sectionId: section.id,
      relations: { course: true },
    });

    expect(sectionWithCourse?.course).toBeDefined();
    expect(sectionWithCourse?.course.id).toBe(course.id);
  });

  it('03.4 - should link section to the correct course', async () => {
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
      title: faker.lorem.words(3),
    });

    const course2 = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.words(3),
    });

    const section1 = await courseManagementService.createSection({
      courseId: course1.id,
      title: faker.lorem.words(3),
    });

    const section2 = await courseManagementService.createSection({
      courseId: course2.id,
      title: faker.lorem.words(3),
    });

    expect(section1.courseId).toBe(course1.id);
    expect(section2.courseId).toBe(course2.id);
    expect(section1.courseId).not.toBe(section2.courseId);
  });
});
