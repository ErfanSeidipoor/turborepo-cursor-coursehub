4. SUBTASK-04: Review previous migrations for conflicts

- Before implementing the migration, review all existing migration files in `packages/postgres/src/migrations/`.
- Identify all previous changes affecting the target tables and columns described in `TASK_DESCRIPTION`.
- Check for potential conflicts, such as:
  - The table or column already exists or was dropped in a previous migration.
  - The column type, nullability, default, or constraints differ from what is being proposed.
  - There are existing indexes, unique constraints, or foreign keys that may conflict with the new change.
- If any conflicts or ambiguities are found, update the migration plan or clarify the intended schema state before proceeding.
- Document any findings or required adjustments in the migration file as comments for future maintainers.
- This review ensures the new migration is consistent with the current schema state and avoids accidental destructive changes or migration failures.

- If you discover any conflict or problem during the review of previous migrations,
- such as:
- - The table or column already exists or was dropped in a previous migration,
- - The column type, nullability, default, or constraints differ from what is being proposed,
- - There are existing indexes, unique constraints, or foreign keys that may conflict with the new change,
- - Any ambiguity about the intended schema state,
- then:
- - Write a clear comment in under the issue describing the conflict or problem.
- - Do NOT continue with the migration or further subtasks until the conflict is resolved and the intended schema state is clarified.
- - This ensures that no destructive or inconsistent changes are introduced into the schema.
