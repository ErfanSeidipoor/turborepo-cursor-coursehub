---
description: This rule defines how every service related to Entities inside `packages/backend-modules/postgres` must be created, named, documented and organized. This package contains all database services with business logic. Whenever the AI (or a teammate) touches a file captured by the `globs` above, include this guidance.
globs:
alwaysApply: false
---

# Postgres Backend Modules Rule (@backend-modules-postgres.md)

This rule defines how every service related to Entities inside `packages/backend-modules/postgres` must be created, named,
documented and organized. This package contains all database services with business logic.
Whenever the AI (or a teammate) touches a file captured by the `globs` above,
include this guidance.

- **Package Purpose**
  - Single source-of-truth for all database services with business logic.
  - Encapsulates TypeORM operations and complex database queries.
  - Provides domain-specific services that abstract repository patterns.
  - Applications should NOT use repositories directly - only through these services.
  - Public API surface is only `packages/backend-modules/postgres/src/index.ts`.

- **Structure**
  - Place service files in `packages/backend-modules/postgres/src/services/`.
  - The list of valid domains is defined in `packages/docs/domains.md`.
  - For each DOMAIN described in that file, you must create a corresponding service in the `services` directory, following the naming and implementation conventions described in this rule set.
  - One service **per domain**; filename must be kebab-case and end with `.service.ts`
    - `authentication.service.ts` (for User entity)
    - `product.service.ts` (for OrderItem entity)
    - `user-management.service.ts` (for ProductCategory entity)
  - Re-export all services through `src/services/index.ts`.
  - **Services Index Export (`src/services/index.ts`)**

    ```typescript
    import { CustomerService } from './customer.service';
    import { InvoiceService } from './invoice.service';
    import { PaymentService } from './payment.service';
    import { ProductService } from './product.service';
    import { SupplierService } from './supplier.service';

    export const services = [
      CustomerService,
      InvoiceService,
      PaymentService,
      ProductService,
      SupplierService,
    ];

    export {
      CustomerService,
      InvoiceService,
      PaymentService,
      ProductService,
      SupplierService,
    };
    ```

- **Service Naming Conventions**
  - Service class → PascalCase & suffixed with `Service`
    - `UserService`, `OrderItemService`, `ProductCategoryService`
  - Service filename → kebab-case & suffixed with `.service.ts`
    - `user.service.ts`, `order-item.service.ts`
  - Methods → camelCase with verb prefixes
    - `createUser(input:{name:string})`,
    - `findUserById(input:{userId:string})`,
    - `updateUser(input:{userId:string})`,
    - `deleteUser(input:{userId:string})`
    - `getUsersByStatus()`, `countActiveUsers()`
  - Parameters → Use specific entity ID naming
    - `userId: string` instead of `id: string`
    - `orderId: string` instead of `id: string`
    - `productId: string` instead of `id: string`

- **Service Definition Checklist**
  - Use `@Injectable()` decorator from NestJS.
  - Inject repositories using `@InjectRepository()`.
  - Use proper TypeScript types for all parameters and return values.
  - Handle errors using `CustomError` from `@repo/http-errors` package - never use standard NestJS exceptions.
  - Define error constants in `@repo/http-errors/src/index.ts` if they don't exist, then import and use them.
  - Validate input parameters at service layer.
  - Always expose raw TypeORM entities - never use DTOs at service level.
  - Use inline type definitions for method parameters instead of separate interfaces.
  - Use specific entity ID naming (e.g., `userId`, `orderId`) instead of generic `id`.
  - Methods should be self-descriptive - avoid unnecessary JSDoc comments.
  - Use `promise<IPaginate<EntityName>>` return type for pagination methods with QueryBuilder and paginate utility.
  - Transactions are handled at higher layers (controllers/handlers) - do not use `@Transactional()` at service level.

- **Service Template**

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { EntityName1, EntityName2, EntityName3 } from '@repo/postgres/entities';
import { IPaginate } from '@repo/dtos/pagination';
import { SortEnum } from '@repo/enums'
import { paginate } from './utils/paginate';
import {
    CustomError,
    ENTITY_NAME_NOT_FOUND,
    ENTITY_NAME_NAME_REQUIRED,
    ENTITY_NAME_NAME_EMPTY
} from '@repo/http-errors';

@Injectable()
export class {Domain}Service {
    constructor(
        @InjectRepository(EntityName1)
        private readonly entityName1Repository: Repository<EntityName1>,
        @InjectRepository(EntityName2)
        private readonly entityName2Repository: Repository<EntityName2>,
        // other entities
    ) {}

    public async createEntityName(input: {
        name: string;
        description?: string;
        isActive?: boolean;
    }): Promise<EntityName> {

        const { name, description, isActive} = input

        // validate based on the DOMAIN-RULES

        const entity = this.entityNameRepository.create({
            name,
            description,
            isActive
        });

        const savedEntity = await this.entityNameRepository.save(entity);
        return savedEntity;
    }



    public async findEntityName1ById(input: {
        entityNameId: string,
        returnError?: boolean
        relations?: FindOptionsRelations<EntityName1> | FindOptionsRelationByString;
    }): Promise<EntityName | undefined> {

        const { entityNameId, returnError } = input

        if(!entityNameId && returnError) {
            if(returnError) {
                return throw new CustomError(ENTITY_NAME_NAME_1_NOT_FOUND);
            }
            else {
                return undefinrelationsed
            }
        }

        const entityName = await this.entityNameRepository.findOne({
            where: { id: entityNameId }
            relations,
        });

        if(!entityName && returnError) {
            return throw new CustomError(ENTITY_NAME_NAME_1_NOT_FOUND);
        }

        return entityName;
    }

    public async updateEntityName(input: {
        entityNameId: string;
        name?: string;
        description?: string;
        isActive?: boolean;
    }): Promise<EntityName> {

        const { entityNameId, name, description, isActive} = input

        const entityName = await this.findEntityName1ById({
            entityNameId,
            returnError: true
        });

        // validate based on the DOMAIN-RULES

        updateValue = {}

        if(name && name !== entityName.name) {
            updateValue.name = name
        }

        if(description && entity.description !== entityName.description) {
           updateValue.description = description
        }

        if(isActive !== undefined &&  isActive !== entityName.isActive) {
            updateValue.isActive = isActive
        }

        await this.entityNameRepository.update({ id: entityNameId }, updateValue)

        return await this.findEntityName1ById({
            entityNameId,
            returnError: true
        });
    }

    public async deleteEntityName(input: {entityNameId: string}): Promise<void> {
        const { entityNameId } = input

        const entityName = await this.findEntityName1ById({
            entityNameId,
            returnError: true
        });

        // validate delete entity on the DOMAIN-RULES

        await entityName.softRemove()
    }

    public async findEntityNames(options: {
        page?: number;
        limit?: number;
        isActive?: boolean;
        searchTerm?: string;
        sort?: string;
        sortType?: SortEnum
    } = {}): Promise<IPaginate<EntityName>> {
        const { page, limit, isActive, searchTerm, sort, sortType } = options;

        const queryBuilder = this.entityNameRepository
            .createQueryBuilder('entityName')
            // add other relations if needed

        if (isActive !== undefined) {
            queryBuilder.andWhere('entityName.isActive = :isActive', { isActive });
        }

        if (searchTerm) {
            queryBuilder.andWhere('(entityName.name ILIKE :searchTerm OR entityName.description ILIKE :searchTerm)' , {
                searchTerm: `%${searchTerm}%`
            });
        }

        if (sort, sortType) {
            queryBuilder.orderBy(sort, sortType );
        }


        return await paginate(queryBuilder, limit, page);
    }
}
```

- **Error Handling Workflow**
  - When implementing error handling in services, follow this workflow:
  - **Check if error exists** in `@repo/http-errors/src/index.ts`
  - **If error doesn't exist**, define it in `@repo/http-errors/src/index.ts`:

    ```typescript
    export const USER_NOT_FOUND: ICustomError = {
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    };

    export const USER_EMAIL_ALREADY_EXISTS: ICustomError = {
      status: HttpStatus.BAD_REQUEST,
      description: 'User with this email already exists',
    };
    ```

  - **Import the error** in your service:
    ```typescript
    import {
      CustomError,
      USER_NOT_FOUND,
      USER_EMAIL_ALREADY_EXISTS,
    } from '@repo/http-errors';
    ```
  - **Use CustomError** in your service methods:

    ```typescript
    if (!user) {
      throw new CustomError(USER_NOT_FOUND);
    }

    if (existingUser) {
      throw new CustomError(USER_EMAIL_ALREADY_EXISTS);
    }
    ```

  - **Error Naming Convention**
    - Error constant names should be `ENTITY_FIELD_ERROR_TYPE` or `ENTITY_ERROR_TYPE`:
      - `USER_NOT_FOUND`, `USER_EMAIL_ALREADY_EXISTS`
      - `ORDER_ITEM_QUANTITY_INVALID`, `ORDER_STATUS_INVALID`
      - `PRODUCT_CATEGORY_NAME_REQUIRED`, `PRODUCT_OUT_OF_STOCK`

- **Business Logic Guidelines**
  - **Validation**: Always validate business rules at the service layer based on the rules that provided here
    `packages/docs/domains.md`

  - **Inline Type Definitions**: Use inline type definitions for method parameters

    ```typescript
    public async createUser(input: {
      email: string;
      firstName: string;
      lastName?: string;
      isActive?: boolean;
    }): Promise<User> {
      // Implementation
    }

    public async updateUser( input: {
      userId: string,
      firstName?: string;
      lastName?: string;
      isActive?: boolean;
    }): Promise<User> {
      // Implementation
    }
    ```

  - **Pagination**: Use `IPaginate<EntityName>` return type with QueryBuilder and paginate utility

    ```typescript
    public async findUsers(options: {
      page?: number;
      limit?: number;
      isActive?: boolean;
      searchTerm?: string;
    } = {}): Promise<IPaginate<User>> {
      const { page, limit, isActive, searchTerm } = options;

      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .orderBy('user.createdAt', 'DESC');

      if (isActive !== undefined) {
        queryBuilder.andWhere('user.isActive = :isActive', { isActive });
      }

      if (searchTerm) {
        queryBuilder.andWhere('user.email ILIKE :searchTerm OR user.firstName ILIKE :searchTerm', {
          searchTerm: `%${searchTerm}%`
        });
      }

      return await paginate(queryBuilder, limit, page);
    }
    ```

  - **Transactions**: Transactions are handled at higher layers (controllers/handlers)

    ```typescript
    public async createOrderWithItems(input: {
      orderData: {
        userId: string;
        totalAmount: number;
        status?: string;
      };
      items: Array<{
        productId: string;
        quantity: number;
        price: number;
      }>;
    }): Promise<Order> {
      const order = await this.createOrder(input.orderData);
      await this.createOrderItems(order.orderId, input.items);
      return order;
    }

    ```

  - **Error Handling**: Use `CustomError` from `@repo/http-errors` package

    ```typescript
    // Define errors in @repo/http-errors/src/index.ts if they don't exist:
    export const USER_NOT_FOUND: ICustomError = {
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    };

    export const INVALID_USER_DATA: ICustomError = {
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid user data',
    };

    export const USER_DELETE_FORBIDDEN: ICustomError = {
      status: HttpStatus.FORBIDDEN,
      description: 'Cannot delete user with active orders',
    };

    export const DATABASE_OPERATION_FAILED: ICustomError = {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Database operation failed',
    };

    // Then import and use in service:
    import {
      CustomError,
      USER_NOT_FOUND,
      INVALID_USER_DATA,
    } from '@repo/http-errors';

    // Usage in service methods:
    throw new CustomError(USER_NOT_FOUND);
    throw new CustomError(INVALID_USER_DATA);
    throw new CustomError(USER_DELETE_FORBIDDEN);
    throw new CustomError(DATABASE_OPERATION_FAILED);
    ```

- **Query Patterns**
  - **Simple Queries**: Use repository methods for single entity operations
    ```typescript
    public async getAllActiveUsers(): Promise<User[]> {
      return await this.userRepository.find({
        where: { isActive: true },
        order: { createdAt: 'DESC' },
      });
    }
    ```
  - **Pagination Queries**: Always use QueryBuilder with paginate utility

    ```typescript
    public async findUsers(input: {
      page?: number;
      limit?: number;
      isActive?: boolean;
    } = {}): Promise<IPaginate<User>> {
      const { page, limit, isActive } = options;

      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .orderBy('user.createdAt', 'DESC');

      if (isActive !== undefined) {
        queryBuilder.andWhere('user.isActive = :isActive', { isActive });
      }

      return await paginate(queryBuilder, limit, page);
    }
    ```

  - **Complex Queries**: Use QueryBuilder for advanced operations
    ```typescript
    public async getUsersWithOrdersCount(): Promise<Array<{
      user: User;
      ordersCount: string;
    }>> {
      return await this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.orders', 'order')
        .select(['user.id', 'user.email', 'user.firstName'])
        .addSelect('COUNT(order.id)', 'ordersCount')
        .groupBy('user.id')
        .getRawAndEntities();
    }
    ```
  - **Raw Queries**: For performance-critical operations
    ```typescript
    public async getAdvancedUserStats(): Promise<Array<{
      userId: string;
      email: string;
      order_count: number;
      total_spent: number;
    }>> {
      return await this.userRepository.query(`
        SELECT
          u.id as userId,
          u.email,
          COUNT(o.id) as order_count,
          SUM(o.total_amount) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.deleted_at IS NULL
        GROUP BY u.id, u.email
        ORDER BY total_spent DESC
      `);
    }
    ```

- **Service Index Export (`src/services/index.ts`)**

  ```typescript
  import { UserService } from './user.service';
  import { OrderService } from './order.service';
  import { OrderItemService } from './order-item.service';

  export const services = [UserService, OrderService, OrderItemService];

  export { UserService, OrderService, OrderItemService };
  ```

- **Assistant reminders (when this rule is active)**
  - Suggest correct service file paths and names based on entities.
  - Always include proper business logic validation.
  - Do not use `@Transactional()` at service level - transactions are handled at higher layers.
  - Return raw entities directly from services - no DTO conversion needed.
  - Update `src/services/index.ts` when new services are added.
  - Use `CustomError` from `@repo/http-errors` package - never use standard NestJS exceptions.
  - Define error constants in `@repo/http-errors/src/index.ts` if they don't exist, then import them.
  - Use inline type definitions for method parameters instead of separate interfaces.
  - Use specific entity ID naming (e.g., `userId`, `orderId`) instead of generic `id`.
  - Keep methods self-descriptive - avoid unnecessary JSDoc comments.
  - Use `IPaginate<EntityName>` return type for pagination with QueryBuilder and paginate utility.
  - Include optional `page` and `limit` parameters in pagination method inputs (paginate function has defaults).
  - Define clear return types using inline type definitions for each service method.
