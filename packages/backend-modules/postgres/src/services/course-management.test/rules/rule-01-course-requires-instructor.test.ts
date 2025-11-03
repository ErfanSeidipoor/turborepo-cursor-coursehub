import { CustomError, COURSE_INSTRUCTOR_NOT_FOUND } from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { CourseManagementService } from '../../course-management.service';
import { UserService } from '../../user.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

/**
 * DOMAIN RULE 1: A Course can only be created by a user who has an associated record in the instructors table (which implies the Instructor privilege).
 *
 * This test suite verifies that courses can only be created when a valid instructor record exists.
 */
describe('Domain Rule 1 - Course Requires Instructor', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('01.1 - should allow creating a course with a valid instructor', async () => {
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

    expect(actualResult).toBeDefined();
    expect(actualResult.instructorId).toBe(instructor.id);
  });

  it('01.2 - should prevent creating a course without a valid instructor', async () => {
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

  it('01.3 - should verify instructor exists before course creation', async () => {
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

    const courseWithInstructor = await courseManagementService.findCourseById({
      courseId: course.id,
      relations: { instructor: true },
    });

    expect(courseWithInstructor?.instructor).toBeDefined();
    expect(courseWithInstructor?.instructor.id).toBe(instructor.id);
  });

  it('01.4 - should link course to the correct instructor', async () => {
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

    const course1 = await courseManagementService.createCourse({
      instructorId: instructor1.id,
      title: faker.lorem.words(3),
    });

    const course2 = await courseManagementService.createCourse({
      instructorId: instructor2.id,
      title: faker.lorem.words(3),
    });

    expect(course1.instructorId).toBe(instructor1.id);
    expect(course2.instructorId).toBe(instructor2.id);
    expect(course1.instructorId).not.toBe(course2.instructorId);
  });
});
