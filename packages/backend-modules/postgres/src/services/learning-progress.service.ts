import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsRelations } from 'typeorm';
import { Enrollment } from '@repo/postgres/entities/enrollment.entity';
import { Progress } from '@repo/postgres/entities/progress.entity';
import { User } from '@repo/postgres/entities/user.entity';
import { Course } from '@repo/postgres/entities/course.entity';
import { Lesson } from '@repo/postgres/entities/lesson.entity';
import { IPaginate } from '@repo/dtos/pagination';
import { SortEnum } from '@repo/enums';
import { paginate } from './utils/paginate';
import {
  CustomError,
  ENROLLMENT_NOT_FOUND,
  ENROLLMENT_USER_ID_REQUIRED,
  ENROLLMENT_COURSE_ID_REQUIRED,
  ENROLLMENT_USER_NOT_FOUND,
  ENROLLMENT_COURSE_NOT_FOUND,
  ENROLLMENT_ALREADY_EXISTS,
  ENROLLMENT_INVALID_COMPLETION_STATUS,
  PROGRESS_NOT_FOUND,
  PROGRESS_ENROLLMENT_ID_REQUIRED,
  PROGRESS_LESSON_ID_REQUIRED,
  PROGRESS_ENROLLMENT_NOT_FOUND,
  PROGRESS_LESSON_NOT_FOUND,
  PROGRESS_INVALID_LAST_WATCHED_TIME,
  PROGRESS_NO_ACTIVE_ENROLLMENT,
} from '@repo/http-errors';

@Injectable()
export class LearningProgressService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  public async createEnrollment(input: {
    userId: string;
    courseId: string;
  }): Promise<Enrollment> {
    const { userId, courseId } = input;

    if (!userId) {
      throw new CustomError(ENROLLMENT_USER_ID_REQUIRED);
    }

    if (!courseId) {
      throw new CustomError(ENROLLMENT_COURSE_ID_REQUIRED);
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new CustomError(ENROLLMENT_USER_NOT_FOUND);
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new CustomError(ENROLLMENT_COURSE_NOT_FOUND);
    }

    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId },
    });

    if (existingEnrollment) {
      throw new CustomError(ENROLLMENT_ALREADY_EXISTS);
    }

    const enrollment = this.enrollmentRepository.create({
      userId,
      courseId,
      completionStatus: 0,
    });

    const savedEnrollment = await this.enrollmentRepository.save(enrollment);
    return savedEnrollment;
  }

  public async findEnrollmentById(input: {
    enrollmentId: string;
    returnError?: boolean;
    relations?: FindOptionsRelations<Enrollment>;
  }): Promise<Enrollment | undefined> {
    const { enrollmentId, returnError, relations } = input;

    if (!enrollmentId) {
      if (returnError) {
        throw new CustomError(ENROLLMENT_NOT_FOUND);
      } else {
        return undefined;
      }
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
      relations,
    });

    if (!enrollment && returnError) {
      throw new CustomError(ENROLLMENT_NOT_FOUND);
    }

    return enrollment || undefined;
  }

  public async updateEnrollment(input: {
    enrollmentId: string;
    completionStatus?: number;
  }): Promise<Enrollment> {
    const { enrollmentId, completionStatus } = input;

    const enrollment = await this.findEnrollmentById({
      enrollmentId,
      returnError: true,
    });

    const updateValue: Partial<Enrollment> = {};

    if (
      completionStatus !== undefined &&
      completionStatus !== enrollment?.completionStatus
    ) {
      if (completionStatus < 0 || completionStatus > 100) {
        throw new CustomError(ENROLLMENT_INVALID_COMPLETION_STATUS);
      }
      updateValue.completionStatus = completionStatus;
    }

    if (Object.keys(updateValue).length > 0) {
      await this.enrollmentRepository.update({ id: enrollmentId }, updateValue);
    }

    return (await this.findEnrollmentById({
      enrollmentId,
      returnError: true,
    })) as Enrollment;
  }

  public async deleteEnrollment(input: {
    enrollmentId: string;
  }): Promise<void> {
    const { enrollmentId } = input;

    const enrollment = await this.findEnrollmentById({
      enrollmentId,
      returnError: true,
    });

    if (!enrollment) {
      throw new CustomError(ENROLLMENT_NOT_FOUND);
    }

    await enrollment.softRemove();
  }

  public async findEnrollments(
    options: {
      page?: number;
      limit?: number;
      userId?: string;
      courseId?: string;
      sort?: string;
      sortType?: SortEnum;
    } = {},
  ): Promise<IPaginate<Enrollment>> {
    const { page, limit, userId, courseId, sort, sortType } = options;

    const queryBuilder =
      this.enrollmentRepository.createQueryBuilder('enrollment');

    if (userId) {
      queryBuilder.andWhere('enrollment.userId = :userId', { userId });
    }

    if (courseId) {
      queryBuilder.andWhere('enrollment.courseId = :courseId', { courseId });
    }

    if (sort && sortType) {
      queryBuilder.orderBy(`enrollment.${sort}`, sortType);
    } else {
      queryBuilder.orderBy('enrollment.createdAt', SortEnum.DESC);
    }

    return await paginate(queryBuilder, limit, page);
  }

  public async createProgress(input: {
    enrollmentId: string;
    lessonId: string;
    isCompleted?: boolean;
    lastWatchedTime?: number;
  }): Promise<Progress> {
    const { enrollmentId, lessonId, isCompleted, lastWatchedTime } = input;

    if (!enrollmentId) {
      throw new CustomError(PROGRESS_ENROLLMENT_ID_REQUIRED);
    }

    if (!lessonId) {
      throw new CustomError(PROGRESS_LESSON_ID_REQUIRED);
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new CustomError(PROGRESS_ENROLLMENT_NOT_FOUND);
    }

    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new CustomError(PROGRESS_LESSON_NOT_FOUND);
    }

    if (lastWatchedTime !== undefined && lastWatchedTime < 0) {
      throw new CustomError(PROGRESS_INVALID_LAST_WATCHED_TIME);
    }

    const progress = this.progressRepository.create({
      enrollmentId,
      lessonId,
      isCompleted: isCompleted ?? false,
      lastWatchedTime: lastWatchedTime ?? 0,
    });

    const savedProgress = await this.progressRepository.save(progress);
    return savedProgress;
  }

  public async findProgressById(input: {
    progressId: string;
    returnError?: boolean;
    relations?: FindOptionsRelations<Progress>;
  }): Promise<Progress | undefined> {
    const { progressId, returnError, relations } = input;

    if (!progressId) {
      if (returnError) {
        throw new CustomError(PROGRESS_NOT_FOUND);
      } else {
        return undefined;
      }
    }

    const progress = await this.progressRepository.findOne({
      where: { id: progressId },
      relations,
    });

    if (!progress && returnError) {
      throw new CustomError(PROGRESS_NOT_FOUND);
    }

    return progress || undefined;
  }

  public async updateProgress(input: {
    progressId: string;
    isCompleted?: boolean;
    lastWatchedTime?: number;
  }): Promise<Progress> {
    const { progressId, isCompleted, lastWatchedTime } = input;

    const progress = await this.findProgressById({
      progressId,
      returnError: true,
      relations: { enrollment: true },
    });

    if (!progress?.enrollment) {
      throw new CustomError(PROGRESS_NO_ACTIVE_ENROLLMENT);
    }

    const updateValue: Partial<Progress> = {};

    if (isCompleted !== undefined && isCompleted !== progress.isCompleted) {
      updateValue.isCompleted = isCompleted;
    }

    if (
      lastWatchedTime !== undefined &&
      lastWatchedTime !== progress.lastWatchedTime
    ) {
      if (lastWatchedTime < 0) {
        throw new CustomError(PROGRESS_INVALID_LAST_WATCHED_TIME);
      }
      updateValue.lastWatchedTime = lastWatchedTime;
    }

    if (Object.keys(updateValue).length > 0) {
      await this.progressRepository.update({ id: progressId }, updateValue);
    }

    return (await this.findProgressById({
      progressId,
      returnError: true,
    })) as Progress;
  }

  public async deleteProgress(input: { progressId: string }): Promise<void> {
    const { progressId } = input;

    const progress = await this.findProgressById({
      progressId,
      returnError: true,
    });

    if (!progress) {
      throw new CustomError(PROGRESS_NOT_FOUND);
    }

    await progress.softRemove();
  }

  public async findProgresses(
    options: {
      page?: number;
      limit?: number;
      enrollmentId?: string;
      lessonId?: string;
      isCompleted?: boolean;
      sort?: string;
      sortType?: SortEnum;
    } = {},
  ): Promise<IPaginate<Progress>> {
    const { page, limit, enrollmentId, lessonId, isCompleted, sort, sortType } =
      options;

    const queryBuilder = this.progressRepository.createQueryBuilder('progress');

    if (enrollmentId) {
      queryBuilder.andWhere('progress.enrollmentId = :enrollmentId', {
        enrollmentId,
      });
    }

    if (lessonId) {
      queryBuilder.andWhere('progress.lessonId = :lessonId', { lessonId });
    }

    if (isCompleted !== undefined) {
      queryBuilder.andWhere('progress.isCompleted = :isCompleted', {
        isCompleted,
      });
    }

    if (sort && sortType) {
      queryBuilder.orderBy(`progress.${sort}`, sortType);
    } else {
      queryBuilder.orderBy('progress.createdAt', SortEnum.DESC);
    }

    return await paginate(queryBuilder, limit, page);
  }
}
