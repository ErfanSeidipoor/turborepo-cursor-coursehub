---
description: This Cursor rule defines the standards and conventions for creating or updating a Postgres domain service, ensuring consistency, maintainability, and alignment with documented domain entities and rules.
globs:
alwaysApply: false
---

# task: create or update postgres domain (@backend-modules-postgres.mdc)

// This rule standardizes how to create or update a Postgres domain service in the monorepo. It ensures proper service implementation, comprehensive testing, and adherence to NestJS and TypeORM best practices within the `packages/backend-modules/postgres` package.

## Inputs Required to Apply This Rule

Provide the following input:

- `DOMAIN`:(required) The name of the domain (e.g., User, Product, Activity). This should be:
  - A singular noun in PascalCase
  - Representing an entity that exists or will exist in the database
  - Aligned with the entity defined in `packages/postgres/src/entities`

## Environment Variables

- All environment variables required for database connections, credentials, or configuration **must** be defined in the `.env` file located at the project root directory. If you need to access these environment variables from any subfolder (such as during migration scripts or local development), **copy and paste** the `.env` file into that subfolder to ensure environment variable resolution works as expected. This practice ensures consistency and prevents issues with missing or misconfigured environment variables during migration execution or development tasks.

The following subtasks must be implemented to deliver a compliant domain service:

- Subtasks for Postgres Domain Service Creation/Update

// The details and specific requirements for each subtask listed below are provided in this directory.
// Please refer to the corresponding file within .cursor/rules/task-create-or-update-postgres-domain/ for full instructions on how to complete each task.

0. SUBTASK-00: Description And Requirement

- .cursor/rules/task-create-or-update-postgres-domain/subtask-00:description-and-requirement.md

1. SUBTASK-01: Check the requirements to implement this task

- .cursor/rules/task-create-or-update-postgres-domain/subtask-01:check-the-requirements-to-implement-this-task.md

2. SUBTASK-02: Create a new feature branch from main

- .cursor/rules/task-create-or-update-postgres-domain/subtask-02:create-a-new-feature-branch-from-main.md

3. SUBTASK-03: Ensure the existence of a domain service file

- .cursor/rules/task-create-or-update-postgres-domain/subtask-03:ensure-the-existence-of-a-domain-service-file.md

4. SUBTASK-04: CRUD operation main entities

- .cursor/rules/task-create-or-update-postgres-domain/subtask-04:crud-operation-main-entities.md

5. SUBTASK-05: Write unit test for domain

- .cursor/rules/task-create-or-update-postgres-domain/subtask-05:write-unit-test-for-domain.md

6. SUBTASK-06: General Rule Compliance

- .cursor/rules/task-create-or-update-postgres-domain/subtask-06:general-rule-compliance.md

7. SUBTASK-07: Verify TypeScript builds and lints

- .cursor/rules/task-create-or-update-postgres-domain/subtask-07:verify-typeScript-builds-and-lints.md

8. SUBTASK-08: General Rule Compliance

- .cursor/rules/task-create-or-update-postgres-domain/subtask-08:general-rule-compliance.md

9. SUBTASK-09: Final readiness check

- .cursor/rules/task-create-or-update-postgres-domain/subtask-09:final-readiness-check.md

10. SUBTASK-010: Create a Pull Request (PR)

- .cursor/rules/task-create-or-update-postgres-domain/subtask-09:create-a-pull-request.md
