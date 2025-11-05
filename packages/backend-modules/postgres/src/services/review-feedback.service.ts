import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsRelations } from 'typeorm';
import { CourseReview } from '@repo/postgres/entities/course-review.entity';
import { User } from '@repo/postgres/entities/user.entity';
import { Course } from '@repo/postgres/entities/course.entity';
import { Enrollment } from '@repo/postgres/entities/enrollment.entity';
import { IPaginate } from '@repo/dtos/pagination';
import { SortEnum } from '@repo/enums';
import { paginate } from './utils/paginate';
import {
  CustomError,
  COURSE_REVIEW_NOT_FOUND,
  COURSE_REVIEW_USER_ID_REQUIRED,
  COURSE_REVIEW_COURSE_ID_REQUIRED,
  COURSE_REVIEW_RATING_REQUIRED,
  COURSE_REVIEW_USER_NOT_FOUND,
  COURSE_REVIEW_COURSE_NOT_FOUND,
  COURSE_REVIEW_ALREADY_EXISTS,
  COURSE_REVIEW_INVALID_RATING,
  COURSE_REVIEW_NO_ENROLLMENT,
} from '@repo/http-errors';

@Injectable()
export class ReviewFeedbackService {
  constructor(
    @InjectRepository(CourseReview)
    private readonly courseReviewRepository: Repository<CourseReview>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  public async createCourseReview(input: {
    userId: string;
    courseId: string;
    rating: number;
    reviewText?: string;
  }): Promise<CourseReview> {
    const { userId, courseId, rating, reviewText } = input;

    if (!userId) {
      throw new CustomError(COURSE_REVIEW_USER_ID_REQUIRED);
    }

    if (!courseId) {
      throw new CustomError(COURSE_REVIEW_COURSE_ID_REQUIRED);
    }

    if (rating === undefined || rating === null) {
      throw new CustomError(COURSE_REVIEW_RATING_REQUIRED);
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new CustomError(COURSE_REVIEW_INVALID_RATING);
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new CustomError(COURSE_REVIEW_USER_NOT_FOUND);
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new CustomError(COURSE_REVIEW_COURSE_NOT_FOUND);
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId },
    });

    if (!enrollment) {
      throw new CustomError(COURSE_REVIEW_NO_ENROLLMENT);
    }

    const existingReview = await this.courseReviewRepository.findOne({
      where: { userId, courseId },
    });

    if (existingReview) {
      throw new CustomError(COURSE_REVIEW_ALREADY_EXISTS);
    }

    const courseReview = this.courseReviewRepository.create({
      userId,
      courseId,
      rating,
      reviewText: reviewText || null,
    });

    const savedReview = await this.courseReviewRepository.save(courseReview);
    return savedReview;
  }

  public async findCourseReviewById(input: {
    reviewId: string;
    returnError?: boolean;
    relations?: FindOptionsRelations<CourseReview>;
  }): Promise<CourseReview | undefined> {
    const { reviewId, returnError, relations } = input;

    if (!reviewId) {
      if (returnError) {
        throw new CustomError(COURSE_REVIEW_NOT_FOUND);
      } else {
        return undefined;
      }
    }

    const review = await this.courseReviewRepository.findOne({
      where: { id: reviewId },
      relations,
    });

    if (!review && returnError) {
      throw new CustomError(COURSE_REVIEW_NOT_FOUND);
    }

    return review;
  }

  public async updateCourseReview(input: {
    reviewId: string;
    rating?: number;
    reviewText?: string;
  }): Promise<CourseReview> {
    const { reviewId, rating, reviewText } = input;

    const review = await this.findCourseReviewById({
      reviewId,
      returnError: true,
    });

    if (!review) {
      throw new CustomError(COURSE_REVIEW_NOT_FOUND);
    }

    const updateValue: Partial<CourseReview> = {};

    if (rating !== undefined) {
      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        throw new CustomError(COURSE_REVIEW_INVALID_RATING);
      }
      updateValue.rating = rating;
    }

    if (reviewText !== undefined) {
      updateValue.reviewText = reviewText || null;
    }

    if (Object.keys(updateValue).length > 0) {
      await this.courseReviewRepository.update({ id: reviewId }, updateValue);
    }

    return (await this.findCourseReviewById({
      reviewId,
      returnError: true,
    })) as CourseReview;
  }

  public async deleteCourseReview(input: { reviewId: string }): Promise<void> {
    const { reviewId } = input;

    const review = await this.findCourseReviewById({
      reviewId,
      returnError: true,
    });

    if (!review) {
      throw new CustomError(COURSE_REVIEW_NOT_FOUND);
    }

    await review.softRemove();
  }

  public async findCourseReviews(
    options: {
      page?: number;
      limit?: number;
      userId?: string;
      courseId?: string;
      minRating?: number;
      maxRating?: number;
      sort?: string;
      sortType?: SortEnum;
    } = {},
  ): Promise<IPaginate<CourseReview>> {
    const {
      page,
      limit,
      userId,
      courseId,
      minRating,
      maxRating,
      sort,
      sortType,
    } = options;

    const queryBuilder =
      this.courseReviewRepository.createQueryBuilder('courseReview');

    if (userId) {
      queryBuilder.andWhere('courseReview.userId = :userId', { userId });
    }

    if (courseId) {
      queryBuilder.andWhere('courseReview.courseId = :courseId', { courseId });
    }

    if (minRating !== undefined) {
      queryBuilder.andWhere('courseReview.rating >= :minRating', { minRating });
    }

    if (maxRating !== undefined) {
      queryBuilder.andWhere('courseReview.rating <= :maxRating', { maxRating });
    }

    if (sort && sortType) {
      queryBuilder.orderBy(`courseReview.${sort}`, sortType);
    } else {
      queryBuilder.orderBy('courseReview.createdAt', SortEnum.DESC);
    }

    return await paginate(queryBuilder, limit, page);
  }

  public async findCourseReviewByUserAndCourse(input: {
    userId: string;
    courseId: string;
    returnError?: boolean;
  }): Promise<CourseReview | undefined> {
    const { userId, courseId, returnError } = input;

    if (!userId || !courseId) {
      if (returnError) {
        throw new CustomError(COURSE_REVIEW_NOT_FOUND);
      } else {
        return undefined;
      }
    }

    const review = await this.courseReviewRepository.findOne({
      where: { userId, courseId },
    });

    if (!review && returnError) {
      throw new CustomError(COURSE_REVIEW_NOT_FOUND);
    }

    return review;
  }
}
