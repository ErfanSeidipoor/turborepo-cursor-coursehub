import { TestManager } from '../../../test-manager.test';
import { LearningProgressService } from '../../learning-progress.service';
import { UserService } from '../../user.service';
import { CourseManagementService } from '../../course-management.service';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { SortEnum } from '@repo/enums';
import { faker } from '@faker-js/faker';

describe('LearningProgressService - findProgresses', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should find all progresses with pagination', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const userService = TestManager.getHandler(UserService);
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );

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

    const section = await courseManagementService.createSection({
      courseId: course.id,
      title: faker.lorem.sentence(),
    });

    const lesson1 = await courseManagementService.createLesson({
      sectionId: section.id,
      title: faker.lorem.sentence(),
      contentUrl: faker.internet.url(),
    });

    const lesson2 = await courseManagementService.createLesson({
      sectionId: section.id,
      title: faker.lorem.sentence(),
      contentUrl: faker.internet.url(),
    });

    const enrollment = await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course.id,
    });

    await learningProgressService.createProgress({
      enrollmentId: enrollment.id,
      lessonId: lesson1.id,
    });

    await learningProgressService.createProgress({
      enrollmentId: enrollment.id,
      lessonId: lesson2.id,
    });

    const actualResult = await learningProgressService.findProgresses({
      page: 1,
      limit: 10,
    });

    expect(actualResult.items.length).toBe(2);
    expect(actualResult.meta?.totalItems).toBe(2);
  });

  it('should filter progresses by enrollmentId', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const userService = TestManager.getHandler(UserService);
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );

    const user1 = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const user2 = await userService.createUser({
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

    const section = await courseManagementService.createSection({
      courseId: course.id,
      title: faker.lorem.sentence(),
    });

    const lesson = await courseManagementService.createLesson({
      sectionId: section.id,
      title: faker.lorem.sentence(),
      contentUrl: faker.internet.url(),
    });

    const enrollment1 = await learningProgressService.createEnrollment({
      userId: user1.id,
      courseId: course.id,
    });

    const enrollment2 = await learningProgressService.createEnrollment({
      userId: user2.id,
      courseId: course.id,
    });

    await learningProgressService.createProgress({
      enrollmentId: enrollment1.id,
      lessonId: lesson.id,
    });

    await learningProgressService.createProgress({
      enrollmentId: enrollment2.id,
      lessonId: lesson.id,
    });

    const actualResult = await learningProgressService.findProgresses({
      enrollmentId: enrollment1.id,
    });

    expect(actualResult.items.length).toBe(1);
    expect(actualResult.items[0]?.enrollmentId).toBe(enrollment1.id);
  });

  it('should filter progresses by lessonId', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const userService = TestManager.getHandler(UserService);
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );

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

    const section = await courseManagementService.createSection({
      courseId: course.id,
      title: faker.lorem.sentence(),
    });

    const lesson1 = await courseManagementService.createLesson({
      sectionId: section.id,
      title: faker.lorem.sentence(),
      contentUrl: faker.internet.url(),
    });

    const lesson2 = await courseManagementService.createLesson({
      sectionId: section.id,
      title: faker.lorem.sentence(),
      contentUrl: faker.internet.url(),
    });

    const enrollment = await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course.id,
    });

    await learningProgressService.createProgress({
      enrollmentId: enrollment.id,
      lessonId: lesson1.id,
    });

    await learningProgressService.createProgress({
      enrollmentId: enrollment.id,
      lessonId: lesson2.id,
    });

    const actualResult = await learningProgressService.findProgresses({
      lessonId: lesson1.id,
    });

    expect(actualResult.items.length).toBe(1);
    expect(actualResult.items[0]?.lessonId).toBe(lesson1.id);
  });

  it('should filter progresses by isCompleted status', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const userService = TestManager.getHandler(UserService);
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );

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

    const section = await courseManagementService.createSection({
      courseId: course.id,
      title: faker.lorem.sentence(),
    });

    const lesson1 = await courseManagementService.createLesson({
      sectionId: section.id,
      title: faker.lorem.sentence(),
      contentUrl: faker.internet.url(),
    });

    const lesson2 = await courseManagementService.createLesson({
      sectionId: section.id,
      title: faker.lorem.sentence(),
      contentUrl: faker.internet.url(),
    });

    const enrollment = await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course.id,
    });

    await learningProgressService.createProgress({
      enrollmentId: enrollment.id,
      lessonId: lesson1.id,
      isCompleted: false,
    });

    const progress2 = await learningProgressService.createProgress({
      enrollmentId: enrollment.id,
      lessonId: lesson2.id,
      isCompleted: true,
    });

    const actualResult = await learningProgressService.findProgresses({
      isCompleted: true,
    });

    expect(actualResult.items.length).toBe(1);
    expect(actualResult.items[0]?.isCompleted).toBe(true);
    expect(actualResult.items[0]?.id).toBe(progress2.id);
  });

  it('should sort progresses by specified field and sort type', async () => {
    const learningProgressService = TestManager.getHandler(
      LearningProgressService,
    );
    const userService = TestManager.getHandler(UserService);
    const courseManagementService = TestManager.getHandler(
      CourseManagementService,
    );

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

    const section = await courseManagementService.createSection({
      courseId: course.id,
      title: faker.lorem.sentence(),
    });

    const lesson1 = await courseManagementService.createLesson({
      sectionId: section.id,
      title: faker.lorem.sentence(),
      contentUrl: faker.internet.url(),
    });

    const lesson2 = await courseManagementService.createLesson({
      sectionId: section.id,
      title: faker.lorem.sentence(),
      contentUrl: faker.internet.url(),
    });

    const enrollment = await learningProgressService.createEnrollment({
      userId: user.id,
      courseId: course.id,
    });

    const progress1 = await learningProgressService.createProgress({
      enrollmentId: enrollment.id,
      lessonId: lesson1.id,
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    const progress2 = await learningProgressService.createProgress({
      enrollmentId: enrollment.id,
      lessonId: lesson2.id,
    });

    const actualResult = await learningProgressService.findProgresses({
      sort: 'createdAt',
      sortType: SortEnum.ASC,
    });

    expect(actualResult.items.length).toBe(2);
    expect(actualResult.items[0]?.id).toBe(progress1.id);
    expect(actualResult.items[1]?.id).toBe(progress2.id);
  });
});
