---
name: 🗃️ Change PostgreSQL Database
about: Create database schema changes via TypeORM migrations, enums, and entities following monorepo standards
title: 'Database Change: [MIGRATION_TITLE]'
labels: ['database', 'postgres', 'migration', 'task:change-postgres']
assignees: ''
---

## 📋 Task Description

Create database schema changes using TypeORM migrations, enum definitions, and entity updates following the monorepo conventions and standards defined in `.cursor/rules/@task-change-postgres.md`.

## 🔧 Required Inputs

### ✅ Required

- **`<TASK_DESCRIPTION>`**: <!-- Clear description of the database change -->
  **Must include all of the following details:**
  - **Target table(s) and exact column changes:**
    - Tables to modify: `table_name_1`, `table_name_2`
    - Columns to add/remove/alter with types, nullability, defaults
    - Example: "Add `status` column to `orders` table as `enum` type, non-nullable, default 'PENDING'"
  - **Foreign key relationships:**
    - Source and target tables/columns
    - onDelete/onUpdate behavior (CASCADE, SET NULL, RESTRICT, etc.)
    - Example: "Add FK from `orders.user_id` to `users.id` with CASCADE delete"
  - **Constraints and indexes:**
    - Unique constraints, check constraints
    - Database indexes for performance
    - Example: "Add unique constraint on `users.email`, add index on `orders.created_at`"
  - **Enum fields (if applicable):**
    - Enum name and all allowed values
    - Example: "OrderStatus enum with values: PENDING, PROCESSING, COMPLETED, CANCELLED"

### 📝 Example Task Description

```
Add order status tracking to the orders table:
- Add 'status' column to 'orders' table as enum type, non-nullable, default 'PENDING'
- Create OrderStatus enum with values: PENDING, PROCESSING, COMPLETED, CANCELLED
- Add 'processed_at' column to 'orders' table as timestamp, nullable
- Add index on 'orders.status' for query performance
- Add index on 'orders.processed_at' for reporting queries
```

**Note:**  
This task must strictly follow the subtasks defined in the `@task-change-postgres.md` Cursor rule. You are required to complete each subtask in the order provided below, and your implementation must comply with all standards and conventions described in the rule. **Choosing, skipping, or reordering subtasks is not permitted.** If you believe an alternative sequence is necessary for a valid reason, document that justification in this issue and seek explicit approval from a maintainer before proceeding.

## Implementation Enforcement Checklist (`.cursor/rules/@task-change-postgres.md`)

> **IMPORTANT:**  
> Completing _every_ subtask in this list is required. Cursor rule enforcement will be checked during review.
>
> - If the rule-defined subtasks (1–14) are not fully implemented in sequence **without unauthorized deviation**, your PR will be rejected or require revision.

- [ ] SUBTASK-00: .cursor/rules/task-change-postgres/subtask-00:description-and-requirement.md
- [ ] SUBTASK-01: .cursor/rules/task-change-postgres/subtask-01:create-a-new-feature-branch-from-main.md
- [ ] SUBTASK-02: .cursor/rules/task-change-postgres/subtask-02:validate-inputs-and-prepare-workspace.md
- [ ] SUBTASK-03: .cursor/rules/task-change-postgres/subtask-03:read-postgres-rules.md
- [ ] SUBTASK-04: .cursor/rules/task-change-postgres/subtask-04:review-previous-migrations-for-conflicts.md
- [ ] SUBTASK-05: .cursor/rules/task-change-postgres/subtask-05:create-a-migration-file.md
- [ ] SUBTASK-06: .cursor/rules/task-change-postgres/subtask-06:implement-up-and-down-methods.md
- [ ] SUBTASK-07: .cursor/rules/task-change-postgres/subtask-07:test-run-and-revert-twice.md
- [ ] SUBTASK-08: .cursor/rules/task-change-postgres/subtask-08:create-or-update-enums-in-@repo-enums.md
- [ ] SUBTASK-09: .cursor/rules/task-change-postgres/subtask-09:update-entities-under-packages-postgres-src-entities.md
- [ ] SUBTASK-10: .cursor/rules/task-change-postgres/subtask-10:ensure-entity-documentation-is-up-to-date.md
- [ ] SUBTASK-11: .cursor/rules/task-change-postgres/subtask-11:verify-typeScript-builds-and-lints.md
- [ ] SUBTASK-12: .cursor/rules/task-change-postgres/subtask-12:final-readiness-check.md
- [ ] SUBTASK-13: .cursor/rules/task-change-postgres/subtask-13:general-rule-compliance.md
- [ ] SUBTASK-14: .cursor/rules/task-change-postgres/subtask-14:create-a-pull-request.md

## ⚠️ STRICT SCOPE ENFORCEMENT

> **Details:**
>
> - You must not select, skip, or reorder subtasks from the Cursor rule; complete all as listed, unless you have written pre-approval.
> - Only change files and configs directly required for this database change task per the attached Cursor rule.
> - Avoid unrelated code changes (no refactoring, no dependency changes, etc.).

> **Why is this necessary?**  
> Monorepo conventions and code integrity depend on all contributors following project rules exactly as described by the relevant Cursor rules. This ensures reliable change tracking, reviewability, and maintains architectural standards.
