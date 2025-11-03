---
description: This Cursor rule defines the standards and step-by-step process for changing the PostgreSQL database schema via TypeORM migrations, enums, and entities in the monorepo.
globs:
alwaysApply: false
---

# task: change postgres database (@postgres.mdc)

This rule standardizes how to change the PostgreSQL schema across the monorepo using TypeORM migrations in `@repo/postgres`, enum definitions in `@repo/enums`, and entity updates in `@repo/postgres/src/entities`. It mirrors the structure of other task rules and must be followed to ensure consistency and safe, reversible schema changes.

## Inputs Required to Apply This Rule

Provide the following input:

- `TASK_DESCRIPTION`:(required) A clear description of the change including:
  - The target table(s) and exact column changes to add/remove/alter
  - Any foreign keys to create/update/remove (with source and target tables/columns and desired onDelete/onUpdate behavior)
  - Column types, nullability, defaults, unique constraints, and indexes
  - Any enum fields involved and their allowed values

## Environment Variables

- All environment variables required for database connections, credentials, or configuration **must** be defined in the `.env` file located at the project root directory. If you need to access these environment variables from any subfolder (such as during migration scripts or local development), **copy and paste** the `.env` file into that subfolder to ensure environment variable resolution works as expected. This practice ensures consistency and prevents issues with missing or misconfigured environment variables during migration execution or development tasks.
