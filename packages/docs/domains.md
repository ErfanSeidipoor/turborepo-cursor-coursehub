## List of DOMAINs

- User
- CourseManagement
- LearningProgress
- ReviewFeedback

---

# User DOMAIN

**DOMAIN-DESCRIPTION:**
Manages user authentication, credentials, and core user identity information. This domain handles user account creation, authentication, and serves as the foundation for user-related entities throughout the system (such as children profiles, activities, and other user-associated data).

**DOMAIN-MAIN-ENTITIES:**

- User: Represents an authenticated user in the system with unique credentials. Contains username and hashed password for authentication purposes, along with base tracking fields (id, createdAt, updatedAt).

**DOMAIN-GENERAL-ENTITIES:**

(none)

**DOMAIN-RULES:**

1. Username must be unique across all users in the system.
2. Password must be stored in hashed format only; plain text passwords are never persisted.
3. Password field is excluded from default queries for security purposes and must be explicitly selected when needed.
4. Username must not exceed 255 characters.
5. A user account cannot be deleted if it has associated child entities (children, activities, etc.).
6. User credentials (username and password) are required fields and cannot be null.
7. User ID is automatically generated as UUID and cannot be manually assigned.
8. Timestamps (createdAt, updatedAt) are automatically managed by the system.

---

# CourseManagement DOMAIN

**DOMAIN-DESCRIPTION:**
Handles the entire content lifecycle, from initial draft to publication and delivery. This includes structuring courses into sections and lessons, managing content metadata, and overseeing content hosting integrations.

**DOMAIN-MAIN-ENTITIES:**

- Course: The main educational product, defined by an instructor, title, and description.
- Section: A logical grouping or module within a course.
- Lesson: The fundamental unit of content (e.g., a video file, quiz, or article text).

**DOMAIN-GENERAL-ENTITIES:**

- Instructor: Extends user capabilities with instructor privileges, bio, and rating. Required for course creation.
- User:

**DOMAIN-RULES:**

1. A Course can only be created by a user who has an associated record in the instructors table (which implies the Instructor privilege).
2. A Course must transition through the workflow statuses (e.g., 'Draft' -> 'Review' -> 'Published'). Only 'Published' courses are visible to students.
3. Every Section must be linked to a valid, existing Course (course_id Foreign Key).
4. Every Lesson must be linked to a valid, existing Section (section_id Foreign Key).
5. order_index fields for sections and lessons must be maintained and unique within their parent entity (course/section) to define playback order.
6. Content URLs (content_url) must be validated

---

# LearningProgress DOMAIN

**DOMAIN-DESCRIPTION:**
Tracks the student experience, including course access permission, detailed consumption progress of content, and the acknowledgement of overall course completion.

**DOMAIN-MAIN-ENTITIES:**

- Enrollment: Grants a specific user access to a specific course.
- Progress: A granular tracking record detailing a student's status on an individual lesson.

**DOMAIN-GENERAL-ENTITIES:**

- Course
- User

**DOMAIN-RULES:**

1. An Enrollment is created directly upon the user taking an "Enroll Now" action for a course.
2. A student can only view the content of a Course if an active Enrollment record exists for that user and course.
3. Progress records must be created lazily (on first attempt to view a lesson) or eagerly (upon enrollment) for all lessons in the enrolled course.
4. A course is marked as fully complete in enrollments.completion_status only when all associated progress.is_completed fields are true.
5. Progress updates (last_watched_time) must only occur if the user has a valid, active Enrollment.

---

# ReviewFeedback DOMAIN

**DOMAIN-DESCRIPTION:**
Manages the quality and social aspects of the platform by handling the submission, moderation, and statistical aggregation of student reviews and ratings.

**DOMAIN-MAIN-ENTITIES:**

- Course Review: A single record containing a student's rating (1-5) and optional text feedback for a course.

**DOMAIN-GENERAL-ENTITIES:**

- Instructor Rating: Derived metric aggregating instructor performance.
- Course Rating: Derived metric aggregating course quality feedback.
- User

**DOMAIN-RULES:**

1. A user can only submit a Course Review if a corresponding Enrollment record exists (i.e., they must be actively enrolled or have completed the course).
2. Only one review record is permitted per user per course.
3. The rating field must be an integer between 1 and 5.
4. The system must automatically recalculate and update the aggregate rating for the respective Course and Instructor immediately after a new review is submitted, updated, or removed.
5. Reviews may be subject to moderation (e.g., flagged or hidden) if they violate content policies.
