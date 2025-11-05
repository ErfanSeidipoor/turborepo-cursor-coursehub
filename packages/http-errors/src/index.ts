import { HttpException, HttpStatus } from '@nestjs/common';

export interface ICustomError {
  status: HttpStatus;
  description: string;
}

export class CustomError extends HttpException {
  constructor({ description, status }: ICustomError) {
    super(description, status);
  }

  static fromError(error: Error, status?: HttpStatus): CustomError {
    return new CustomError({
      status: status || HttpStatus.INTERNAL_SERVER_ERROR,
      description: error.message,
    });
  }
}

export const USER_NOT_FOUND: ICustomError = {
  status: HttpStatus.NOT_FOUND,
  description: 'User Not Found',
};

export const USER_USERNAME_ALREADY_EXISTS: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'User With This Username Already Exists',
};

export const INVALID_CREDENTIALS: ICustomError = {
  status: HttpStatus.UNAUTHORIZED,
  description: 'Invalid Credentials',
};

export const INVALID_CURRENT_PASSWORD: ICustomError = {
  status: HttpStatus.UNAUTHORIZED,
  description: 'Invalid Current Password',
};

export const USER_USERNAME_REQUIRED: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Username Is Required',
};

export const USER_PASSWORD_REQUIRED: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Password Is Required',
};

export const USER_USERNAME_EMPTY: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Username Cannot Be Empty',
};

export const USER_PASSWORD_EMPTY: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Password Cannot Be Empty',
};

// ============================================================================
// INSTRUCTOR ERRORS
// ============================================================================

export const INSTRUCTOR_NOT_FOUND: ICustomError = {
  status: HttpStatus.NOT_FOUND,
  description: 'Instructor Not Found',
};

export const INSTRUCTOR_USER_ID_REQUIRED: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'User ID Is Required For Instructor',
};

export const INSTRUCTOR_USER_ALREADY_INSTRUCTOR: ICustomError = {
  status: HttpStatus.CONFLICT,
  description: 'User Is Already An Instructor',
};

// ============================================================================
// COURSE ERRORS
// ============================================================================

export const COURSE_NOT_FOUND: ICustomError = {
  status: HttpStatus.NOT_FOUND,
  description: 'Course Not Found',
};

export const COURSE_TITLE_REQUIRED: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Course Title Is Required',
};

export const COURSE_TITLE_EMPTY: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Course Title Cannot Be Empty',
};

export const COURSE_INSTRUCTOR_ID_REQUIRED: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Instructor ID Is Required For Course',
};

export const COURSE_INSTRUCTOR_NOT_FOUND: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Instructor Not Found For This Course',
};

export const COURSE_INVALID_STATUS_TRANSITION: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Invalid Course Status Transition',
};

// ============================================================================
// SECTION ERRORS
// ============================================================================

export const SECTION_NOT_FOUND: ICustomError = {
  status: HttpStatus.NOT_FOUND,
  description: 'Section Not Found',
};

export const SECTION_TITLE_REQUIRED: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Section Title Is Required',
};

export const SECTION_TITLE_EMPTY: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Section Title Cannot Be Empty',
};

export const SECTION_COURSE_ID_REQUIRED: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Course ID Is Required For Section',
};

export const SECTION_COURSE_NOT_FOUND: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Course Not Found For This Section',
};

// ============================================================================
// LESSON ERRORS
// ============================================================================

export const LESSON_NOT_FOUND: ICustomError = {
  status: HttpStatus.NOT_FOUND,
  description: 'Lesson Not Found',
};

export const LESSON_TITLE_REQUIRED: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Lesson Title Is Required',
};

export const LESSON_TITLE_EMPTY: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Lesson Title Cannot Be Empty',
};

export const LESSON_SECTION_ID_REQUIRED: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Section ID Is Required For Lesson',
};

export const LESSON_SECTION_NOT_FOUND: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Section Not Found For This Lesson',
};

export const LESSON_INVALID_CONTENT_URL: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Invalid Content URL For Lesson',
};

// ============================================================================
// ENROLLMENT ERRORS
// ============================================================================

export const ENROLLMENT_NOT_FOUND: ICustomError = {
  status: HttpStatus.NOT_FOUND,
  description: 'Enrollment Not Found',
};

export const ENROLLMENT_USER_ID_REQUIRED: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'User ID Is Required For Enrollment',
};

export const ENROLLMENT_COURSE_ID_REQUIRED: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Course ID Is Required For Enrollment',
};

export const ENROLLMENT_USER_NOT_FOUND: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'User Not Found For This Enrollment',
};

export const ENROLLMENT_COURSE_NOT_FOUND: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Course Not Found For This Enrollment',
};

export const ENROLLMENT_ALREADY_EXISTS: ICustomError = {
  status: HttpStatus.CONFLICT,
  description: 'User Is Already Enrolled In This Course',
};

export const ENROLLMENT_INVALID_COMPLETION_STATUS: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Invalid Completion Status Value',
};

// ============================================================================
// PROGRESS ERRORS
// ============================================================================

export const PROGRESS_NOT_FOUND: ICustomError = {
  status: HttpStatus.NOT_FOUND,
  description: 'Progress Not Found',
};

export const PROGRESS_ENROLLMENT_ID_REQUIRED: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Enrollment ID Is Required For Progress',
};

export const PROGRESS_LESSON_ID_REQUIRED: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Lesson ID Is Required For Progress',
};

export const PROGRESS_ENROLLMENT_NOT_FOUND: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Enrollment Not Found For This Progress',
};

export const PROGRESS_LESSON_NOT_FOUND: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Lesson Not Found For This Progress',
};

export const PROGRESS_INVALID_LAST_WATCHED_TIME: ICustomError = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Invalid Last Watched Time Value',
};

export const PROGRESS_NO_ACTIVE_ENROLLMENT: ICustomError = {
  status: HttpStatus.FORBIDDEN,
  description: 'No Active Enrollment Found For Progress Update',
};
