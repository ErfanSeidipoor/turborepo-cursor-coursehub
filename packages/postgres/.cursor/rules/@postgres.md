---
description: Single source-of-truth for all PostgreSQL database entities and migrations.
globs:
alwaysApply: false
---

- **Package Purpose**
  - Single source-of-truth for all PostgreSQL database entities and migrations.
  - TypeORM-based data layer with consistent entity definitions and migration management.
  - Centralized database schema management across the monorepo.
  - Public API surface is only `packages/postgres/src/index.ts`.

- **Structure**
  - Place entity files in `packages/postgres/src/entities/`.
  - Place migration files in `packages/postgres/src/migrations/`.
  - Data source configuration in `packages/postgres/src/data-source.ts`.
  - One entity **per file**; filename must be kebab-case and end with `.entity.ts`
    - `user.entity.ts`
    - `order-item.entity.ts`
  - Migration files follow TypeORM naming convention: `{timestamp}-{description}.ts`
    - `1640995200000-CreateUserTable.ts`
    - `1640995300000-AddEmailToUser.ts`
  - Re-export all entities through `src/index.ts` (named exports, alphabetical).

- **Entity Naming Conventions**
  - Entity class → PascalCase, no suffix needed
    - `User`, `OrderItem`, `ProductCategory`
  - Table names → snake_case (via @Entity decorator)
    - `@Entity('users')`, `@Entity('order_items')`
  - Column names → snake_case (via @Column name property)
    - `@Column({ name: 'first_name' })`
  - Property names → camelCase (TypeScript standard)
    - `firstName`, `createdAt`, `isActive`

- **Entity Definition Checklist**
  - Use TypeORM decorators (`@Entity`, `@Column`, `@PrimaryGeneratedColumn`, etc.).
  - Always specify table name explicitly in `@Entity('table_name')`.
  - Include primary key with `@PrimaryGeneratedColumn('uuid')` (prefer UUID).
  - Add timestamps (`createdAt`, `updatedAt`) for auditing.
  - Use appropriate column types and constraints.
  - Provide JSDoc comments for the entity class and complex properties.
  - Define relationships with proper cascade options.
  - Use enums from `@repo/enum` package for enum fields.

- **Table and Column Documentation Standards**
  - **Table Documentation**:  
    Every entity (table) must include a JSDoc block directly above the class definition describing:
    - The table name.
    - A concise summary of the data stored.
    - Key constraints (e.g., unique, foreign keys, required fields).
    - Relationships to other tables.

    Example:

    ```ts
    /**
     * TABLE-NAME: <table_name>
     * TABLE-DESCRIPTION: <Brief description of the data represented in this table>
     * TABLE-IMPORTANT-CONSTRAINTS:
     *   - <Constraint 1>
     *   - <Constraint 2>
     * TABLE-RELATIONSHIPS:
     *   - <Relationship 1>
     *   - <Relationship 2>
     */
    ```

  - **Column Documentation**:  
    Each column must have a JSDoc block above its property describing:
    - What the column stores.
    - Any important constraints (e.g., nullable, unique, foreign key).

    Example:

    ```ts
    /**
     * COLUMN-DESCRIPTION: <Brief description of the data and constraints for this column>
     */
    ```

- **Entity Template Example**

  ```typescript
  import { Entity, Column } from 'typeorm';
  import { SomeStatusEnum } from '@repo/enum';
  import { BaseEntity } from './base.entity';

  /**
   * TABLE-NAME: <EntityName>
   * TABLE-DESCRIPTION: <Brief description>
   * TABLE-IMPORTANT-CONSTRAINTS:
   *   - <Constraint 1>
   *   - <Constraint 2>
   * TABLE-RELATIONSHIPS:
   *   - <Relationship 1>
   *   - <Relationship 2>
   */
  @Entity('table_name')
  export class <EntityName> extends BaseEntity {
    /**
     * COLUMN-DESCRIPTION: <Brief description>
     */
    @Column({
      name: 'property_name',
      type: 'varchar',
      length: 255,
      nullable: false,
    })
    propertyName: string;

    /**
     * COLUMN-DESCRIPTION: <Brief description>
     */
    @Column({
      name: 'status',
      type: 'enum',
      enum: SomeStatusEnum,
      default: SomeStatusEnum.ACTIVE,
    })
    status: SomeStatusEnum;
  }
  ```

- **Migration Guidelines**
  - Use descriptive names that explain what the migration does.
  - Always test migrations both up and down directions.
  - Keep migrations atomic and reversible when possible.
  - Use TypeORM QueryRunner for complex operations.
  - Never modify existing migrations that have been run in production.

- **Migration Commands Reference**

  ```bash
  # Create a new migration
  pnpm migration:create --name=MIGRATION_NAME

  # Run pending migrations
  pnpm migration:run

  # Revert last migration
  pnpm migration:revert

  # Show migration status
  pnpm migration:show

  # Drop entire schema (DANGER - development only)
  pnpm schema:drop
  ```

- **Relationship Guidelines**
  - Use `@OneToMany`, `@ManyToOne`, `@OneToOne`, `@ManyToMany` appropriately.
  - Always specify the inverse side of relationships.
  - Use `cascade: true` carefully (prefer explicit saves).
  - Use `eager: false` by default (prefer explicit loading).
  - Consider using `@JoinColumn` for foreign key customization.
  - Example relationship:

    ```typescript
    @OneToMany(() => Order, order => order.user, { cascade: false, eager: false })
    orders: Order[];

    @ManyToOne(() => User, user => user.orders, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
    ```

- **Data Source Configuration**
  - Environment-based configuration using dotenv.
  - Proper connection pooling settings.
  - Migration and entity path configuration.
  - Logging configuration for development vs production.

- **Index Export (`src/index.ts`)**

  ```typescript
  // Entities - alphabetical order
  export { Order } from './entities/order.entity';
  export { OrderItem } from './entities/order-item.entity';
  export { User } from './entities/user.entity';

  // Data source
  export { AppDataSource } from './data-source';

  // Types
  export type { DataSourceOptions } from 'typeorm';
  ```

- **Basic Migration Template**

  ```typescript
  import { MigrationInterface, QueryRunner } from 'typeorm';
  import { DatabaseCreateTable, DatabaseCreateForeignKey } from './utils';

  export class User1698050493644 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
      await DatabaseCreateTable(queryRunner, 'users', [
        {
          name: 'username',
          type: 'varchar',
          length: '256',
          isNullable: true,
          default: null,
        },
        {
          name: 'password',
          type: 'varchar',
          length: '255',
          isNullable: false,
          default: null,
        },
      ]);

      await DatabaseCreateTable(queryRunner, 'orders', [
        {
          name: 'user_id',
          type: 'uuid',
          isNullable: false,
          default: null,
        },
        {
          name: 'status',
          type: 'enum',
          enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
          isNullable: false,
          default: "'PENDING'",
        },
        {
          name: 'total_amount',
          type: 'decimal',
          precision: '10',
          scale: '2',
          isNullable: false,
          default: '0.00',
        },
      ]);

      // Create foreign key relationship to users table
      await DatabaseCreateForeignKey(queryRunner, 'orders', 'users', 'user_id');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable('user');
    }
  }
  ```

- **Enum Field Guidance**
  - When defining a column that represents an enum (e.g., status, type, category), always use the `type: 'enum'` and reference the corresponding TypeScript enum from the `@repo/enums` package.
  - The enum values in the migration and entity must match the TypeScript enum exactly.
  - Do not use `varchar` or `string` for enum fields; always use the `enum` type in both the database schema and entity definition.
  - When creating or updating an enum field at the DB level, ensure the enum is defined and exported in `packages/enums/src/` and referenced in the entity.
  - Example:
    ```ts
    @Column({ name: 'status', type: 'enum', enum: OrderStatusEnum, default: OrderStatusEnum.PENDING })
    status: OrderStatusEnum;
    ```
  - In migrations, use the `enum` type and provide the enum values as an array:
    ```ts
    {
      name: 'status',
      type: 'enum',
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
      isNullable: false,
      default: "'PENDING'",
    }
    ```
  - Always follow the enum conventions and update the central enums package as needed.
    IMPORTANT: When creating or updating enums, always follow the enum naming and structure rules defined in packages/enums/.cursor/rules/@enums.mdc.

- **Assistant reminders (when this rule is active)**
  - Always suggest proper entity structure with TypeORM decorators.
  - Ensure proper naming conventions (snake_case for DB, camelCase for TypeScript).
  - Include JSDoc documentation for entities and complex properties.
  - Update `src/index.ts` barrel when new entities are added.
  - Remind about migration best practices and testing.
  - Suggest using enums from `@repo/enum` package for status fields.
  - Always specify explicit table and column names.
