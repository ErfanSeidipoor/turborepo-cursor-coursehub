import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsRelations } from 'typeorm';
import { Course } from '@repo/postgres/entities/course.entity';
import { Section } from '@repo/postgres/entities/section.entity';
import { Lesson } from '@repo/postgres/entities/lesson.entity';
import { Instructor } from '@repo/postgres/entities/instructor.entity';
import { IPaginate } from '@repo/dtos/pagination';
import { SortEnum, CoursesStatusEnum } from '@repo/enums';
import { paginate } from './utils/paginate';
import {
  CustomError,
  INSTRUCTOR_NOT_FOUND,
  COURSE_NOT_FOUND,
  COURSE_TITLE_REQUIRED,
  COURSE_TITLE_EMPTY,
  COURSE_INSTRUCTOR_ID_REQUIRED,
  COURSE_INSTRUCTOR_NOT_FOUND,
  SECTION_NOT_FOUND,
  SECTION_TITLE_REQUIRED,
  SECTION_TITLE_EMPTY,
  SECTION_COURSE_ID_REQUIRED,
  SECTION_COURSE_NOT_FOUND,
  LESSON_NOT_FOUND,
  LESSON_TITLE_REQUIRED,
  LESSON_TITLE_EMPTY,
  LESSON_SECTION_ID_REQUIRED,
  LESSON_SECTION_NOT_FOUND,
} from '@repo/http-errors';

/**
 * CourseManagementService handles the entire content lifecycle for courses, sections, and lessons.
 * This service manages:
 * - Course CRUD operations (draft to publication workflow)
 * - Section CRUD operations (logical grouping within courses)
 * - Lesson CRUD operations (fundamental content units)
 * - Instructor validation and relationships
 */
@Injectable()
export class CourseManagementService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
  ) {}

  // ============================================================================
  // INSTRUCTOR METHODS
  // ============================================================================

  /**
   * Finds an instructor by their ID.
   * Used internally to validate instructor existence before course creation.
   */
  public async findInstructorById(input: {
    instructorId: string;
    returnError?: boolean;
    relations?: FindOptionsRelations<Instructor>;
  }): Promise<Instructor | undefined> {
    const { instructorId, returnError, relations } = input;

    if (!instructorId) {
      if (returnError) {
        throw new CustomError(INSTRUCTOR_NOT_FOUND);
      } else {
        return undefined;
      }
    }

    const instructor = await this.instructorRepository.findOne({
      where: { id: instructorId },
      relations,
    });

    if (!instructor && returnError) {
      throw new CustomError(INSTRUCTOR_NOT_FOUND);
    }

    return instructor || undefined;
  }

  // ============================================================================
  // COURSE CRUD OPERATIONS
  // ============================================================================

  /**
   * Creates a new course with the specified instructor, title, and optional description.
   * DOMAIN RULE 1: A Course can only be created by a user who has an associated record in the instructors table.
   */
  public async createCourse(input: {
    instructorId: string;
    title: string;
    description?: string;
    status?: CoursesStatusEnum;
  }): Promise<Course> {
    const { instructorId, title, description, status } = input;

    if (!instructorId) {
      throw new CustomError(COURSE_INSTRUCTOR_ID_REQUIRED);
    }

    if (!title) {
      throw new CustomError(COURSE_TITLE_REQUIRED);
    }

    if (title.trim().length === 0) {
      throw new CustomError(COURSE_TITLE_EMPTY);
    }

    // DOMAIN RULE 1: Verify instructor exists
    const instructor = await this.findInstructorById({
      instructorId,
      returnError: false,
    });

    if (!instructor) {
      throw new CustomError(COURSE_INSTRUCTOR_NOT_FOUND);
    }

    const course = this.courseRepository.create({
      instructorId,
      title: title.trim(),
      description: description?.trim() || null,
      status: status || CoursesStatusEnum.DRAFT,
    });

    const savedCourse = await this.courseRepository.save(course);
    return savedCourse;
  }

  /**
   * Finds a course by its ID with optional relations.
   */
  public async findCourseById(input: {
    courseId: string;
    returnError?: boolean;
    relations?: FindOptionsRelations<Course>;
  }): Promise<Course | undefined> {
    const { courseId, returnError, relations } = input;

    if (!courseId) {
      if (returnError) {
        throw new CustomError(COURSE_NOT_FOUND);
      } else {
        return undefined;
      }
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations,
    });

    if (!course && returnError) {
      throw new CustomError(COURSE_NOT_FOUND);
    }

    return course || undefined;
  }

  /**
   * Updates an existing course's title, description, or status.
   * DOMAIN RULE 2: Courses must transition through workflow statuses (Draft -> Review -> Published).
   */
  public async updateCourse(input: {
    courseId: string;
    title?: string;
    description?: string;
    status?: CoursesStatusEnum;
  }): Promise<Course> {
    const { courseId, title, description, status } = input;

    const course = await this.findCourseById({
      courseId,
      returnError: true,
    });

    const updateValue: Partial<Course> = {};

    if (title !== undefined && title !== course?.title) {
      if (title.trim().length === 0) {
        throw new CustomError(COURSE_TITLE_EMPTY);
      }
      updateValue.title = title.trim();
    }

    if (description !== undefined && description !== course?.description) {
      updateValue.description = description.trim() || null;
    }

    if (status !== undefined && status !== course?.status) {
      updateValue.status = status;
    }

    if (Object.keys(updateValue).length > 0) {
      await this.courseRepository.update({ id: courseId }, updateValue);
    }

    return (await this.findCourseById({
      courseId,
      returnError: true,
    })) as Course;
  }

  /**
   * Soft deletes a course by its ID.
   */
  public async deleteCourse(input: { courseId: string }): Promise<void> {
    const { courseId } = input;

    const course = await this.findCourseById({
      courseId,
      returnError: true,
    });

    if (!course) {
      throw new CustomError(COURSE_NOT_FOUND);
    }

    await course.softRemove();
  }

  /**
   * Finds courses with pagination, filtering, and sorting options.
   * DOMAIN RULE 2: Only 'Published' courses should be visible to students (enforced at API level).
   */
  public async findCourses(
    options: {
      page?: number;
      limit?: number;
      instructorId?: string;
      status?: CoursesStatusEnum;
      searchTerm?: string;
      sort?: string;
      sortType?: SortEnum;
    } = {},
  ): Promise<IPaginate<Course>> {
    const { page, limit, instructorId, status, searchTerm, sort, sortType } =
      options;

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor');

    if (instructorId) {
      queryBuilder.andWhere('course.instructorId = :instructorId', {
        instructorId,
      });
    }

    if (status) {
      queryBuilder.andWhere('course.status = :status', { status });
    }

    if (searchTerm) {
      queryBuilder.andWhere(
        '(course.title ILIKE :searchTerm OR course.description ILIKE :searchTerm)',
        {
          searchTerm: `%${searchTerm}%`,
        },
      );
    }

    if (sort && sortType) {
      queryBuilder.orderBy(`course.${sort}`, sortType);
    } else {
      queryBuilder.orderBy('course.createdAt', SortEnum.DESC);
    }

    return await paginate(queryBuilder, limit, page);
  }

  // ============================================================================
  // SECTION CRUD OPERATIONS
  // ============================================================================

  /**
   * Creates a new section within a course.
   * DOMAIN RULE 3: Every Section must be linked to a valid, existing Course.
   */
  public async createSection(input: {
    courseId: string;
    title: string;
    orderIndex?: number;
  }): Promise<Section> {
    const { courseId, title, orderIndex } = input;

    if (!courseId) {
      throw new CustomError(SECTION_COURSE_ID_REQUIRED);
    }

    if (!title) {
      throw new CustomError(SECTION_TITLE_REQUIRED);
    }

    if (title.trim().length === 0) {
      throw new CustomError(SECTION_TITLE_EMPTY);
    }

    // DOMAIN RULE 3: Verify course exists
    const course = await this.findCourseById({
      courseId,
      returnError: false,
    });

    if (!course) {
      throw new CustomError(SECTION_COURSE_NOT_FOUND);
    }

    const section = this.sectionRepository.create({
      courseId,
      title: title.trim(),
      orderIndex: orderIndex !== undefined ? orderIndex : 0,
    });

    const savedSection = await this.sectionRepository.save(section);
    return savedSection;
  }

  /**
   * Finds a section by its ID with optional relations.
   */
  public async findSectionById(input: {
    sectionId: string;
    returnError?: boolean;
    relations?: FindOptionsRelations<Section>;
  }): Promise<Section | undefined> {
    const { sectionId, returnError, relations } = input;

    if (!sectionId) {
      if (returnError) {
        throw new CustomError(SECTION_NOT_FOUND);
      } else {
        return undefined;
      }
    }

    const section = await this.sectionRepository.findOne({
      where: { id: sectionId },
      relations,
    });

    if (!section && returnError) {
      throw new CustomError(SECTION_NOT_FOUND);
    }

    return section || undefined;
  }

  /**
   * Updates an existing section's title or orderIndex.
   * DOMAIN RULE 5: order_index fields for sections must be maintained and unique within their parent course.
   */
  public async updateSection(input: {
    sectionId: string;
    title?: string;
    orderIndex?: number;
  }): Promise<Section> {
    const { sectionId, title, orderIndex } = input;

    const section = await this.findSectionById({
      sectionId,
      returnError: true,
    });

    const updateValue: Partial<Section> = {};

    if (title !== undefined && title !== section?.title) {
      if (title.trim().length === 0) {
        throw new CustomError(SECTION_TITLE_EMPTY);
      }
      updateValue.title = title.trim();
    }

    if (orderIndex !== undefined && orderIndex !== section?.orderIndex) {
      updateValue.orderIndex = orderIndex;
    }

    if (Object.keys(updateValue).length > 0) {
      await this.sectionRepository.update({ id: sectionId }, updateValue);
    }

    return (await this.findSectionById({
      sectionId,
      returnError: true,
    })) as Section;
  }

  /**
   * Soft deletes a section by its ID.
   */
  public async deleteSection(input: { sectionId: string }): Promise<void> {
    const { sectionId } = input;

    const section = await this.findSectionById({
      sectionId,
      returnError: true,
    });

    if (!section) {
      throw new CustomError(SECTION_NOT_FOUND);
    }

    await section.softRemove();
  }

  /**
   * Finds sections with pagination, filtering, and sorting options.
   */
  public async findSections(
    options: {
      page?: number;
      limit?: number;
      courseId?: string;
      searchTerm?: string;
      sort?: string;
      sortType?: SortEnum;
    } = {},
  ): Promise<IPaginate<Section>> {
    const { page, limit, courseId, searchTerm, sort, sortType } = options;

    const queryBuilder = this.sectionRepository
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.course', 'course');

    if (courseId) {
      queryBuilder.andWhere('section.courseId = :courseId', { courseId });
    }

    if (searchTerm) {
      queryBuilder.andWhere('section.title ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    if (sort && sortType) {
      queryBuilder.orderBy(`section.${sort}`, sortType);
    } else {
      queryBuilder.orderBy('section.orderIndex', SortEnum.ASC);
    }

    return await paginate(queryBuilder, limit, page);
  }

  // ============================================================================
  // LESSON CRUD OPERATIONS
  // ============================================================================

  /**
   * Creates a new lesson within a section.
   * DOMAIN RULE 4: Every Lesson must be linked to a valid, existing Section.
   */
  public async createLesson(input: {
    sectionId: string;
    title: string;
    contentUrl?: string;
  }): Promise<Lesson> {
    const { sectionId, title, contentUrl } = input;

    if (!sectionId) {
      throw new CustomError(LESSON_SECTION_ID_REQUIRED);
    }

    if (!title) {
      throw new CustomError(LESSON_TITLE_REQUIRED);
    }

    if (title.trim().length === 0) {
      throw new CustomError(LESSON_TITLE_EMPTY);
    }

    // DOMAIN RULE 4: Verify section exists
    const section = await this.findSectionById({
      sectionId,
      returnError: false,
    });

    if (!section) {
      throw new CustomError(LESSON_SECTION_NOT_FOUND);
    }

    const lesson = this.lessonRepository.create({
      sectionId,
      title: title.trim(),
      contentUrl: contentUrl?.trim() || null,
    });

    const savedLesson = await this.lessonRepository.save(lesson);
    return savedLesson;
  }

  /**
   * Finds a lesson by its ID with optional relations.
   */
  public async findLessonById(input: {
    lessonId: string;
    returnError?: boolean;
    relations?: FindOptionsRelations<Lesson>;
  }): Promise<Lesson | undefined> {
    const { lessonId, returnError, relations } = input;

    if (!lessonId) {
      if (returnError) {
        throw new CustomError(LESSON_NOT_FOUND);
      } else {
        return undefined;
      }
    }

    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations,
    });

    if (!lesson && returnError) {
      throw new CustomError(LESSON_NOT_FOUND);
    }

    return lesson || undefined;
  }

  /**
   * Updates an existing lesson's title or contentUrl.
   */
  public async updateLesson(input: {
    lessonId: string;
    title?: string;
    contentUrl?: string;
  }): Promise<Lesson> {
    const { lessonId, title, contentUrl } = input;

    const lesson = await this.findLessonById({
      lessonId,
      returnError: true,
    });

    const updateValue: Partial<Lesson> = {};

    if (title !== undefined && title !== lesson?.title) {
      if (title.trim().length === 0) {
        throw new CustomError(LESSON_TITLE_EMPTY);
      }
      updateValue.title = title.trim();
    }

    if (contentUrl !== undefined && contentUrl !== lesson?.contentUrl) {
      updateValue.contentUrl = contentUrl.trim() || null;
    }

    if (Object.keys(updateValue).length > 0) {
      await this.lessonRepository.update({ id: lessonId }, updateValue);
    }

    return (await this.findLessonById({
      lessonId,
      returnError: true,
    })) as Lesson;
  }

  /**
   * Soft deletes a lesson by its ID.
   */
  public async deleteLesson(input: { lessonId: string }): Promise<void> {
    const { lessonId } = input;

    const lesson = await this.findLessonById({
      lessonId,
      returnError: true,
    });

    if (!lesson) {
      throw new CustomError(LESSON_NOT_FOUND);
    }

    await lesson.softRemove();
  }

  /**
   * Finds lessons with pagination, filtering, and sorting options.
   */
  public async findLessons(
    options: {
      page?: number;
      limit?: number;
      sectionId?: string;
      searchTerm?: string;
      sort?: string;
      sortType?: SortEnum;
    } = {},
  ): Promise<IPaginate<Lesson>> {
    const { page, limit, sectionId, searchTerm, sort, sortType } = options;

    const queryBuilder = this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.section', 'section');

    if (sectionId) {
      queryBuilder.andWhere('lesson.sectionId = :sectionId', { sectionId });
    }

    if (searchTerm) {
      queryBuilder.andWhere('lesson.title ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    if (sort && sortType) {
      queryBuilder.orderBy(`lesson.${sort}`, sortType);
    } else {
      queryBuilder.orderBy('lesson.createdAt', SortEnum.DESC);
    }

    return await paginate(queryBuilder, limit, page);
  }
}
