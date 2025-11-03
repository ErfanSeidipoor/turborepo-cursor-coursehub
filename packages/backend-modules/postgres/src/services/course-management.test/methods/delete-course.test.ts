import { CustomError, COURSE_NOT_FOUND } from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { CourseManagementService } from '../../course-management.service';
import { UserService } from '../../user.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { Course } from '@repo/postgres/entities/course.entity';
import { faker } from '@faker-js/faker';

describe('CourseManagementService - deleteCourse', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should soft delete a course', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const userService = TestManager.getHandler(UserService);
    const instructorRepository = TestManager.getRepository(Instructor);
    const courseRepository = TestManager.getRepository(Course);

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

    await courseManagementService.deleteCourse({ courseId: course.id });

    const deletedCourse = await courseRepository.findOne({
      where: { id: course.id },
      withDeleted: true,
    });

    expect(deletedCourse).toBeDefined();
    expect(deletedCourse?.deletedAt).toBeDefined();
  });

  it('should throw COURSE_NOT_FOUND when course does not exist', async () => {
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const fakeCourseId = faker.string.uuid();

    await expect(
      courseManagementService.deleteCourse({ courseId: fakeCourseId }),
    ).rejects.toThrow(new CustomError(COURSE_NOT_FOUND));
  });

  it('should not find course after soft delete without withDeleted', async () => {
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

    await courseManagementService.deleteCourse({ courseId: course.id });

    const actualResult = await courseManagementService.findCourseById({
      courseId: course.id,
    });

    expect(actualResult).toBeUndefined();
  });
});
