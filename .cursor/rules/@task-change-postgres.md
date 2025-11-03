---
description: This Cursor rule defines the standards and step-by-step process for changing the PostgreSQL database schema via TypeORM migrations, enums, and entities in the monorepo.
globs:
alwaysApply: false
---

# task: change postgres database (@postgres.mdc)

// This rule standardizes how to change the PostgreSQL schema across the monorepo using TypeORM migrations in `@repo/postgres`, enum definitions in `@repo/enums`, and entity updates in `@repo/postgres/src/entities`. It mirrors the structure of other task rules and must be followed to ensure consistency and safe, reversible schema changes.

## Inputs Required to Apply This Rule

Provide the following input:

- `TASK_DESCRIPTION`:(required) A clear description of the change including:
  - The target table(s) and exact column changes to add/remove/alter
  - Any foreign keys to create/update/remove (with source and target tables/columns and desired onDelete/onUpdate behavior)
  - Column types, nullability, defaults, unique constraints, and indexes
  - Any enum fields involved and their allowed values

## Environment Variables

- All environment variables required for database connections, credentials, or configuration **must** be defined in the `.env` file located at the project root directory. If you need to access these environment variables from any subfolder (such as during migration scripts or local development), **copy and paste** the `.env` file into that subfolder to ensure environment variable resolution works as expected. This practice ensures consistency and prevents issues with missing or misconfigured environment variables during migration execution or development tasks.

The following subtasks must be implemented to deliver a compliant and reversible database change:

- Subtasks for Postgres Database Change

// The details and specific requirements for each subtask listed below are provided in this directory.
// Please refer to the corresponding file within .cursor/rules/task-change-postgres/ for full instructions on how to complete each task.

0. SUBTASK-00: Description And Requirement

- .cursor/rules/task-change-postgres/subtask-00:description-and-requirement.md

1. SUBTASK-1: Create a new feature branch from main

- .cursor/rules/task-change-postgres/subtask-01:create-a-new-feature-branch-from-main.md

2. SUBTASK-2: Validate inputs and prepare workspace

- .cursor/rules/task-change-postgres/subtask-02:validate-inputs-and-prepare-workspace.md

3. SUBTASK-3: Read Postgres Rules

- .cursor/rules/task-change-postgres/subtask-03:read-postgres-rules.md

4. SUBTASK-4: Review previous migrations for conflicts

- .cursor/rules/task-change-postgres/subtask-04:review-previous-migrations-for-conflicts.md

5. SUBTASK-5: Create a migration file

- .cursor/rules/task-change-postgres/subtask-05:create-a-migration-file.md

6. SUBTASK-6: Implement up and down methods

- .cursor/rules/task-change-postgres/subtask-06:implement-up-and-down-methods.md

7. SUBTASK-7: Test run and revert twice

- .cursor/rules/task-change-postgres/subtask-07:test-run-and-revert-twice.md

8. SUBTASK-8: Create or update enums in @repo/enums (when enum fields are involved)

- .cursor/rules/task-change-postgres/subtask-08:create-or-update-enums-in-@repo-enums.md

9. SUBTASK-9: Update entities under packages/postgres/src/entities

- .cursor/rules/task-change-postgres/subtask-09:update-entities-under-packages-postgres-src-entities.md

10. SUBTASK-10: Ensure entity documentation is up-to-date

- .cursor/rules/task-change-postgres/subtask-10:ensure-entity-documentation-is-up-to-date.md

11. SUBTASK-11: Verify TypeScript builds and lints

- .cursor/rules/task-change-postgres/subtask-11:verify-typeScript-builds-and-lints.md

12. SUBTASK-12: Final readiness check

- .cursor/rules/task-change-postgres/subtask-12:final-readiness-check.md

13. SUBTASK-13: General Rule Compliance

- .cursor/rules/task-change-postgres/subtask-13:general-rule-compliance.md

14. SUBTASK-14: Create a Pull Request (PR)

- .cursor/rules/task-change-postgres/subtask-14:create-a-pull-request.md
