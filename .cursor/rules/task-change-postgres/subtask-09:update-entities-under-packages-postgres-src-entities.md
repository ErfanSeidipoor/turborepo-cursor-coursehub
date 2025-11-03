9. SUBTASK-09: Update entities under packages/postgres/src/entities

- Reflect the schema changes in entity classes (see @postgres.mdc Entity Definition Checklist):
  - Ensure table name is explicit via `@Entity('table_name')`.
  - Add/alter/remove columns using camelCase properties with snake_case `name` mapping.
  - For enums, set `type: 'enum'` and `enum: YourEnum` and default if applicable.
  - Maintain relationships with correct `@ManyToOne`/`@OneToMany` annotations and FK column names.
  - Update `packages/postgres/src/entities/index.ts` if new entities were added.
  - follow the standards and detailed guidance described in `packages/postgres/.cursor/rules/@postgres.md`.

```ts
// Example column mapping
@Column({ name: 'status', type: 'enum', enum: OrderStatusEnum, default: OrderStatusEnum.PENDING })
status: OrderStatusEnum;
```

### Entity Definition Important Points (`@postgres.md`)

- **Entity Base Class:**  
  All entities must extend from `BaseEntity` defined in `packages/postgres/src/entities/base.entity.ts`.

- **Explicit Table Name:**  
  Always use `@Entity('table_name')` decorator with the table name explicitly specified in `snake_case`.

- **Column Property Mapping:**  
  Use `@Column({ name: 'db_column_name', ... })` with entity class properties in `camelCase`, mapping them to database columns in `snake_case`.

- **Enums:**  
  For enum fields, use:

  ```ts
  @Column({ name: 'status', type: 'enum', enum: StatusEnum, default: StatusEnum.DEFAULT })
  status: StatusEnum
  ```

  Always set `type: 'enum'`, provide the enum class, and add `default` if needed.

- **Nullable & Defaults:**  
  Explicitly define `nullable: true/false` and provide appropriate defaults for all columns as per schema.

- **Relationships:**
  - Use `@ManyToOne`, `@OneToMany`, etc., including `@JoinColumn({ name: 'foreign_key_column' })` to ensure correct FK column names.
  - Relationship properties must be in camelCase, foreign key columns in snake_case.

- **Entity Registration:**  
  Update `packages/postgres/src/entities/index.ts` whenever new entities are introduced, to ensure they are registered.

- **General conventions:**
  - Use PascalCase for class names, camelCase for property names, snake_case for DB names.
  - Align entity and DTO field names logically.

**See `@postgres.md` for further details and extended examples.**
