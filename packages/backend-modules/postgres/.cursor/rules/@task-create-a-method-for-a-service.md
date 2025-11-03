---
description: This Cursor rule defines how to add a new method to an existing Postgres domain service in packages/backend-modules/postgres, following the module/service conventions and error-handling standards.
globs:
  alwaysApply: false
---

# task: create a method for a postgres service (@backend-modules-postgres.mdc)

// This rule adds a new method to an existing service in `packages/backend-modules/postgres`, conforming to the service conventions: strict typing, repository usage, `CustomError` handling, and no DTOs at service layer.

## Inputs Required to Apply This Rule

To implement this rule, provide the following inputs:

- `<SERVICE>`:(required) The service name in PascalCase with `Service` suffix (e.g., `UserService`). The file is `packages/backend-modules/postgres/src/services/<service>.service.ts` (kebab-case).
- `<METHOD>`:(required) The method name in camelCase (e.g., `findUserByEmail`, `createUser`).
- `<INPUT_PARAMS>`:(required) The method input parameters and their TypeScript types. Prefer a single object parameter with an inline type definition.
- `<FUNCTIONALITY>`:(required) A concise description of the core functionality (e.g., "find one by email", "create entity", "update entity", "delete entity", "paginate list").
- `<RETURN_TYPE>`:(optional) The exact TypeScript return type (e.g., `Promise<User>`, `Promise<void>`, `Promise<IPaginate<User>>`). If omitted, choose the appropriate type based on functionality.
- `<ENTITIES>`:(optional) Array of TypeORM entity class names (PascalCase) exported from `@repo/postgres` that the method uses. If any are not injected, add constructor injections.
- `<ERROR_CONSTANTS>`:(optional) List of error constants from `@repo/http-errors` to use (e.g., `USER_NOT_FOUND`, `USER_EMAIL_ALREADY_EXISTS`). Add missing constants to `packages/http-errors/src/index.ts`.

The following subtasks must be implemented to deliver the method in compliance with this rule:

- **Subtasks for Postgres Service Method Delivery**

1. **SUBTASK-1: Validate inputs and preconditions**

- Ensure the service file exists at `packages/backend-modules/postgres/src/services/<service>.service.ts`.
- Validate `<METHOD>` is camelCase and does not already exist in the service.
- If `<ENTITIES>` provided:
  - Ensure each exists and is exported from `@repo/postgres`.
  - Ensure each has a corresponding `@InjectRepository(Entity) private readonly <entity>Repository: Repository<Entity>` in the constructor. If not, add it.

2. **SUBTASK-2: Add or update imports and constructor injections**

- Ensure the service imports the following where needed:
  - `Injectable` from `@nestjs/common` (already present).
  - `InjectRepository` from `@nestjs/typeorm` and `Repository` from `typeorm`.
  - `<ENTITIES>` from `@repo/postgres` if used in the method.
  - `CustomError` and required `<ERROR_CONSTANTS>` from `@repo/http-errors` when validations are added.
  - `IPaginate` from `@repo/dtos` and `paginate` from `./utils/paginate` when implementing pagination.

3. **SUBTASK-3: Implement the method (choose the appropriate template)**

- Insert the method inside the service class, below existing public methods and above private validators. Keep it under ~20 instructions, use early returns, and inline input types.
- Choose one of the templates below and adapt placeholders to your domain.

```typescript
// Template: Find one by criteria
public async <METHOD>(input: { <criteriaProps> }): Promise<<Entity>> {
  const entity = await this.<entity>Repository.findOne({
    where: { /* map input to where */ } as FindOptionsWhere<<Entity>>,
  });
  if (!entity) {
    throw new CustomError(<ENTITY>_NOT_FOUND);
  }
  return entity;
}
```

```typescript
// Template: Create entity
public async <METHOD>(input: { /* props */ }): Promise<<Entity>> {
  await this.validateCreateData(input); // or a new private validator specific to this method
  // Optional uniqueness check
  // const existing = await this.<entity>Repository.findOne({ where: { uniqueField: input.uniqueField } });
  // if (existing) throw new CustomError(<ENTITY>_<FIELD>_ALREADY_EXISTS);
  const entity = this.<entity>Repository.create(input);
  return await this.<entity>Repository.save(entity);
}
```

```typescript
// Template: Update entity by id
public async <METHOD>(
  <entity>Id: string,
  input: { /* updatable props */ },
): Promise<<Entity>> {
  const entity = await this.<METHOD_TO_GET_BY_ID>(<entity>Id); // or inline find + NOT_FOUND
  // validations
  // if (input.name !== undefined && !input.name.trim()) throw new CustomError(<ENTITY>_NAME_EMPTY);
  Object.assign(entity, input);
  return await this.<entity>Repository.save(entity);
}
```

```typescript
// Template: Delete entity by id (soft delete)
public async <METHOD>(<entity>Id: string): Promise<void> {
  await this.<METHOD_TO_GET_BY_ID>(<entity>Id); // ensures NOT_FOUND when missing
  // await this.validateDeletion(<entity>Id); // optional
  await this.<entity>Repository.softDelete(<entity>Id);
}
```

```typescript
// Template: Paginated list with optional search
public async <METHOD>(options: { page?: number; limit?: number; searchTerm?: string } = {}): Promise<IPaginate<<Entity>>> {
  const { page, limit, searchTerm } = options;
  const qb = this.<entity>Repository
    .createQueryBuilder('<entity>')
    .orderBy('<entity>.createdAt', 'DESC');
  if (searchTerm) {
    qb.andWhere('<entity>.name ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
  }
  return await paginate(qb, limit, page);
}
```

4. **SUBTASK-4: Add or reuse error constants**

- Use `CustomError` from `@repo/http-errors`. If an error constant does not exist, add it to `packages/http-errors/src/index.ts` following the naming convention `ENTITY_FIELD_ERROR_TYPE` or `ENTITY_ERROR_TYPE` (e.g., `USER_NOT_FOUND`, `USER_EMAIL_ALREADY_EXISTS`).

```typescript
import {
  CustomError,
  USER_NOT_FOUND,
  USER_EMAIL_ALREADY_EXISTS,
} from '@repo/http-errors';
```

5. **SUBTASK-5: Enforce service conventions**

- Do not use DTOs at the service layer. Return raw entities or `IPaginate<Entity>`.
- Keep methods small and single-purpose; prefer inline input types and early returns.
- Use specific identifier names (e.g., `userId`, `orderId`) instead of generic `id`.
- Do not add `@Transactional()` here; transactions are handled in higher layers.

6. **SUBTASK-6: Final checks and readiness**

- Ensure the service compiles with strict typing and no `any`.
- Verify that any new imports and constructor injections are present and correctly typed.
- Run a quick build/test if applicable to confirm no regressions.

// End of task definition
