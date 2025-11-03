---
description: This Cursor rule defines the standards and conventions for creating or updating a Postgres domain service, ensuring consistency, maintainability, and alignment with documented domain entities and rules.
globs:
alwaysApply: false
---

# task: create or update postgres domain (@backend-modules-postgres.mdc)

This rule defines the standards and conventions for creating or updating the PostgresDomain Service ensuring consistency, maintainability, and proper documentation

## Inputs Required to Apply This Rule

To implement this rule, provide the following inputs:

- `<DOMAIN>`:(required) The name of the Domain.

## Environment Variables

- All environment variables required for database connections, credentials, or configuration **must** be defined in the `.env` file located at the project root directory. If you need to access these environment variables from any subfolder (such as during migration scripts or local development), **copy and paste** the `.env` file into that subfolder to ensure environment variable resolution works as expected. This practice ensures consistency and prevents issues with missing or misconfigured environment variables during migration execution or development tasks.

The following subtasks must be implemented to deliver API endpoints in compliance with this rule:
