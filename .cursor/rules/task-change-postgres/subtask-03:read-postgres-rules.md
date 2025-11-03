3. SUBTASK-03: Read Postgres Rules

- Before implementing any migration changes, you must read and understand the PostgreSQL package rules and conventions.
- Read the file `packages/postgres/.cursor/rules/@postgres.md` to understand:
  - Entity naming conventions (PascalCase for classes, snake_case for DB)
  - Table and column documentation standards
  - Migration guidelines and best practices
  - Relationship guidelines
  - Enum field guidance
  - Helper utilities available (DatabaseCreateTable, DatabaseCreateForeignKey, etc.)
- This step ensures you follow all monorepo standards and use the correct patterns when implementing migrations and entities.
- If you don't read this file first, your implementation may not comply with project standards and will require revision.
- read that file first, no matter what. Don't rely on glob searches alone; use direct path
