# Database Tables

The following tables form the relational core of the application:

## users

**Purpose:** Stores user profiles for all users. The access control is now implicit, based on the existence of an associated instructors record.

**Key Fields:**

- `id` (Primary Key): UUID
- `username`: VARCHAR(255)
- `password`: VARCHAR(255)

---

## instructors

**Purpose:** Specific details and statistics for users acting as instructors. The existence of a record in this table implicitly grants Instructor privileges.

**Key Fields:**

- `user_id` (Primary Key, Foreign Key referencing `users.id`): UUID
- `bio`: TEXT
- `rating`: NUMERIC(3, 2) (e.g., 4.50)

---

## courses

**Purpose:** Main catalog of available courses. The price field has been removed as all courses are free.

**Key Fields:**

- `id` (Primary Key): UUID
- `instructor_id` (Foreign Key referencing `instructors.user_id`): UUID
- `title`: VARCHAR(255)
- `description`: TEXT
- `status`: VARCHAR(50) (ENUM) (Draft, Review, Published, Archived, Deleted)

---

## sections

**Purpose:** Logical grouping of lessons within a course.

**Key Fields:**

- `id` (Primary Key): UUID
- `course_id` (Foreign Key referencing `courses.id`): UUID
- `title`: VARCHAR(255)
- `order_index`: INTEGER

---

## lessons

**Purpose:** The individual learning content unit (video, quiz, article).

**Key Fields:**

- `id` (Primary Key): UUID
- `section_id` (Foreign Key referencing `sections.id`): UUID
- `title`: VARCHAR(255)
- `content_url`: TEXT

---

## enrollments

**Purpose:** Records a student's active registration in a course. Serves as a junction table.

**Key Fields:**

- Composite Primary Key: `(user_id, course_id)`
- `user_id`: UUID
- `course_id`: UUID
- `enrollment_date`: TIMESTAMP WITH TIME ZONE
- `completion_status`: NUMERIC(5, 2) (Percentage)

---

## course_reviews

**Purpose:** Stores student feedback, ratings, and text reviews.

**Key Fields:**

- `id` (Primary Key): UUID
- `user_id` (Foreign Key referencing `users.id`): UUID
- `course_id` (Foreign Key referencing `courses.id`): UUID
- `rating`: SMALLINT (1-5)
- `review_text`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE

---

## progress

**Purpose:** Tracks a student's completion status for each lesson.

**Key Fields:**

- `id` (Primary Key): UUID
- `enrollment_id` (Foreign Key referencing `enrollments`): UUID (Assumed surrogate key on enrollments for simplicity)
- `lesson_id` (Foreign Key referencing `lessons.id`): UUID
- `is_completed`: BOOLEAN
- `last_watched_time`: INTEGER (e.g., seconds watched)
