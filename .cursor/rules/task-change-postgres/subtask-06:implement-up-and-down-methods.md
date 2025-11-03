6. SUBTASK-06: Implement up and down methods

- Open the generated file under `packages/postgres/src/migrations/` and implement both `up` and `down` using TypeORM’s `QueryRunner`.
- Follow the guidance from @postgres.mdc:
  - Use helper utilities like `DatabaseCreateTable` and `DatabaseCreateForeignKey` when creating tables/relations.
  - For alters, prefer explicit operations: `addColumn`, `dropColumn`, `changeColumn`, `createIndex`, `dropIndex`, `createForeignKey`, `dropForeignKey` as appropriate.
  - Ensure `down` precisely reverses `up` in the correct order (drop FKs/indexes before dropping columns/tables).
  - Use snake_case for DB names; map to camelCase in entities via the `name` property.
  - consider enum fields they should be type:enum

- The migration file implementation (in `packages/postgres/src/migrations/`) **must** follow the standards and detailed guidance described in `packages/postgres/.cursor/rules/@postgres.md`. This includes:
  - Refer to `@postgres.md` for examples, required patterns, and additional context before writing or reviewing any migration code.

  ## Migration Implementation Guidelines for `packages/postgres`
  - **Use TypeORM Migration API:**  
    Implement both `up(queryRunner: QueryRunner)` and `down(queryRunner: QueryRunner)` methods as defined by TypeORM's standard migration framework.

  - **Leverage Migration Helpers:**  
    **You MUST use the provided migration helpers in ALL cases:**
    - `DatabaseCreateTable`
    - `DatabaseCreateForeignKey`

    **Do NOT manually define tables or foreign keys with raw SQL or direct TypeORM API calls unless absolutely required and justified with clear documentation.**
    Failure to use these helpers will result in your migration being rejected during review.
    When altering schema, prefer explicit functions:  
     `addColumn`, `dropColumn`, `changeColumn`, `createIndex`, `dropIndex`, `createForeignKey`, `dropForeignKey`  
     Avoid raw SQL unless strictly necessary.

  - **Naming Conventions:**
    - Use `snake_case` for all database tables and columns.
    - In entities, map DB fields to camelCase via the `name` property where appropriate.

  - **Handling Enum Fields:**
    - Define enum fields using `type: 'enum'`.
    - Ensure enum types are explicitly created and dropped as part of your migrations.

  - **Reversible Migrations:**
    - The `down` method must precisely and explicitly undo changes made in `up`.
      1. Always drop foreign keys and indexes before removing columns or tables.
      2. Drop columns before dropping tables.

  - **Migration Safety:**
    - Use DDL transactions via `QueryRunner` to prevent partial/mid-state migrations.

  - **Explicitness & Comments:**
    - Favor clear, step-by-step operations over "smart" diffs.
    - Comment intentions when the reasons behind schema decisions or reversals are not obvious.

  - **Schema Details:**
    - Always declare default values, whether columns are nullable, and all constraints (e.g., uniqueness, PKs) directly in table/column creation.

  - **Referential Integrity:**
    - When managing relationships (foreign keys, cascade rules), always ensure referential integrity is considered and maintained.

  - **Reference Documentation:**
    - Before completing a migration, review and follow all relevant patterns, extended examples, and best practices described in `@postgres.md`.
