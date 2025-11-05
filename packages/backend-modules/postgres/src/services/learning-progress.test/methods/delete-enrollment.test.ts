import { CustomError, ENROLLMENT_NOT_FOUND } from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { LearningProgressService } from '../../learning-progress.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { Enrollment } from '@repo/postgres/entities/enrollment.entity';
import { faker } from '@faker-js/faker';

describe('LearningProgressService - deleteEnrollment', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should soft delete enrollment', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const userService = TestManager.getHandler(UserService);
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );
    const enrollmentRepository = TestManager.getRepository(Enrollment);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const instructorUser = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const instructorRepository = TestManager.getRepository(Instructor);
    const instructor = instructorRepository.create({
      userId: instructorUser.id,
      bio: faker.lorem.paragraph(),
    });
    await instructorRepository.save(instructor);

    const course = await courseManagementService.createCourse({
      instructorId: instructor.id,
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
    });

    const enrollment = await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course.id,
    });

    await learningProgressService.deleteEnrollment({
      enrollmentId: enrollment.id,
    });

    const deletedEnrollment = await enrollmentRepository.findOne({
      where: { id: enrollment.id },
      withDeleted: true,
    });

    expect(deletedEnrollment).toBeDefined();
    expect(deletedEnrollment?.deletedAt).toBeInstanceOf(Date);
  });

  it('should throw ENROLLMENT_NOT_FOUND when enrollment does not exist', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const nonExistentId = faker.string.uuid();

    await expect(
      learningProgressService.deleteEnrollment({
        enrollmentId: nonExistentId,
      }),
    ).rejects.toThrow(new CustomError(ENROLLMENT_NOT_FOUND));
  });
});
