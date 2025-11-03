import { CustomError, COURSE_NOT_FOUND } from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { CourseManagementService } from '../../course-management.service';
import { UserService } from '../../user.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { faker } from '@faker-js/faker';

describe('CourseManagementService - findCourseById', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should find a course by its ID', async () => {
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

    const actualResult = await courseManagementService.findCourseById({
      courseId: course.id,
    });

    expect(actualResult).toBeDefined();
    expect(actualResult?.id).toBe(course.id);
    expect(actualResult?.title).toBe(course.title);
  });

  it('should return undefined when course is not found and returnError is false', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const fakeCourseId = faker.string.uuid();

    const actualResult = await courseManagementService.findCourseById({
      courseId: fakeCourseId,
      returnError: false,
    });

    expect(actualResult).toBeUndefined();
  });

  it('should throw COURSE_NOT_FOUND when course is not found and returnError is true', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const fakeCourseId = faker.string.uuid();

    await expect(
      courseManagementService.findCourseById({
        courseId: fakeCourseId,
        returnError: true,
      }),
    ).rejects.toThrow(new CustomError(COURSE_NOT_FOUND));
  });

  it('should return undefined when courseId is empty and returnError is false', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );

    const actualResult = await courseManagementService.findCourseById({
      courseId: '',
      returnError: false,
    });

    expect(actualResult).toBeUndefined();
  });

  it('should throw COURSE_NOT_FOUND when courseId is empty and returnError is true', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );

    await expect(
      courseManagementService.findCourseById({
        courseId: '',
        returnError: true,
      }),
    ).rejects.toThrow(new CustomError(COURSE_NOT_FOUND));
  });

  it('should load instructor relation when specified', async () => {
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

    const actualResult = await courseManagementService.findCourseById({
      courseId: course.id,
      relations: { instructor: true },
    });

    expect(actualResult).toBeDefined();
    expect(actualResult?.instructor).toBeDefined();
    expect(actualResult?.instructor.id).toBe(instructor.id);
  });
});
