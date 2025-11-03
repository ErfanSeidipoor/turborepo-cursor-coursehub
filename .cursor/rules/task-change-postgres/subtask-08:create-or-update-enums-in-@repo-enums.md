8. SUBTASK-08: Create or update enums in @repo/enums (when enum fields are involved)

- If the change introduces or modifies an enum field at the DB level:
  - Define the corresponding TypeScript enum under `packages/enums/src/` following the @enums.mdc rule.
  - Use PascalCase for enum name and UPPER_SNAKE_CASE for members.
  - Export from `packages/enums/src/index.ts`.

```ts
// packages/enums/src/order-status.enum.ts
export enum OrderStatusEnum {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// packages/enums/src/index.ts
export { OrderStatusEnum } from './order-status.enum';
```

- Reference this enum in entities and, when needed, in migrations that create `enum` columns.
- follow the standards and detailed guidance described in `packages/enums/.cursor/rules/@enums.mdc`.
- The enum field in the migration must match the enum values in the TypeScript enum, If there is any mismatch or ambiguity, update the migration, or enum definition so that all are consistent and correct before proceeding.
