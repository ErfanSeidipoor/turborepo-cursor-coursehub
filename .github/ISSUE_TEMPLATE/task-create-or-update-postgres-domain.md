---
name: 🏗️ Create or Update PostgreSQL Domain Service
about: Create or update a Postgres domain service with CRUD operations following monorepo standards
title: 'Domain Service: [DOMAIN_NAME]'
labels:
  [
    'database',
    'postgres',
    'domain-service',
    'task:create-or-update-postgres-domain',
  ]
assignees: ''
---

## 📋 Task Description

Create or update a PostgreSQL domain service that implements CRUD operations for domain entities, following the monorepo conventions and standards defined in `.cursor/rules/@task-create-or-update-postgres-domain.md`.

## 🔧 Required Inputs

### ✅ Required

- **`<DOMAIN>`**: <!-- The name of the domain to create or update -->
  **Must include:**
  - Domain name (e.g., "User", "Product", "Order")
  - The domain **must** be properly documented in `packages/docs/domains.md` with:
    - `DOMAIN-DESCRIPTION`: Summary or definition of the domain's purpose
    - `DOMAIN-MAIN-ENTITIES`: Primary entities that define this domain
    - `DOMAIN-GENERAL-ENTITIES`: Supporting or shared entities (if applicable)
    - `DOMAIN-RULES`: Business rules, invariants, or constraints

### 📝 Example Domain Input

```
Domain: User

The User domain must be documented in packages/docs/domains.md with:
- DOMAIN-DESCRIPTION: Manages user accounts, authentication, and profile information
- DOMAIN-MAIN-ENTITIES: User (with fields: id, username, email, password, createdAt, updatedAt)
- DOMAIN-GENERAL-ENTITIES: UserProfile, UserSettings
- DOMAIN-RULES:
  1. Username must be unique
  2. Password must be hashed before storage
  3. Email must be validated
  4. Users cannot be hard deleted (soft delete only)
```

**Note:**  
This task must strictly follow the subtasks defined in the `@task-create-or-update-postgres-domain.md` Cursor rule. You are required to complete each subtask in the order provided below, and your implementation must comply with all standards and conventions described in the rule. **Choosing, skipping, or reordering subtasks is not permitted.** If you believe an alternative sequence is necessary for a valid reason, document that justification in this issue and seek explicit approval from a maintainer before proceeding.

## Implementation Enforcement Checklist (`.cursor/rules/@task-create-or-update-postgres-domain.md`)

> **IMPORTANT:**  
> Completing _every_ subtask in this list is required. Cursor rule enforcement will be checked during review.
>
> - If the rule-defined subtasks (0–10) are not fully implemented in sequence **without unauthorized deviation**, your PR will be rejected or require revision.

- [ ] SUBTASK-00: .cursor/rules/task-create-or-update-postgres-domain/subtask-00:description-and-requirement.md
- [ ] SUBTASK-01: .cursor/rules/task-create-or-update-postgres-domain/subtask-01:check-the-requirements-to-implement-this-task.md
- [ ] SUBTASK-02: .cursor/rules/task-create-or-update-postgres-domain/subtask-02:create-a-new-feature-branch-from-main.md
- [ ] SUBTASK-03: .cursor/rules/task-create-or-update-postgres-domain/subtask-03:ensure-the-existence-of-a-domain-service-file.md
- [ ] SUBTASK-04: .cursor/rules/task-create-or-update-postgres-domain/subtask-04:crud-operation-main-entities.md
- [ ] SUBTASK-05: .cursor/rules/task-create-or-update-postgres-domain/subtask-05:write-unit-test-for-domain.md
- [ ] SUBTASK-06: .cursor/rules/task-create-or-update-postgres-domain/subtask-06:general-rule-compliance.md
- [ ] SUBTASK-07: .cursor/rules/task-create-or-update-postgres-domain/subtask-07:verify-typeScript-builds-and-lints.md
- [ ] SUBTASK-08: .cursor/rules/task-create-or-update-postgres-domain/subtask-08:general-rule-compliance.md
- [ ] SUBTASK-09: .cursor/rules/task-create-or-update-postgres-domain/subtask-09:final-readiness-check.md
- [ ] SUBTASK-10: .cursor/rules/task-create-or-update-postgres-domain/subtask-09:create-a-pull-request.md

## ⚠️ STRICT SCOPE ENFORCEMENT

> **Details:**
>
> - You must not select, skip, or reorder subtasks from the Cursor rule; complete all as listed, unless you have written pre-approval.
> - Only change files and configs directly required for this domain service task per the attached Cursor rule.
> - Avoid unrelated code changes (no refactoring, no dependency changes, etc.).

> **Why is this necessary?**  
> Monorepo conventions and code integrity depend on all contributors following project rules exactly as described by the relevant Cursor rules. This ensures reliable change tracking, reviewability, and maintains architectural standards.

## 🔗 Related Documentation

- Domain Documentation: `packages/docs/domains.md`
- Backend Modules Postgres Rule: `packages/backend-modules/postgres/.cursor/rules/@backend-modules-postgres.md`
- Entity Definitions: `packages/postgres/src/entities/`
- Test Examples: `packages/backend-modules/postgres/src/services/user.test/`
