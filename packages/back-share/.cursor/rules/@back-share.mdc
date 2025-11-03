---
description: Conventions, layout and templates for the central dtos package
globs: 
alwaysApply: false
---
- **Package Purpose**
  - Single source-of-truth for all shared API Data Transfer Objects (DTOs).
  - Guarantees validation consistency between frontend and backend.
  - Enables type-safe API contracts across the monorepo.
  - Public API surface is only `packages/dto/src/index.ts`.

- **Structure**
  - Place source files in `packages/dto/src/`.
  - Group DTOs by app name and module name in subdirectories (with optional submodule):
    - `packages/dto/src/[name of the backend-app]/[name-of-the-module]/`
    - `packages/dto/src/api/user/`
    - `packages/dto/src/api/order/`
    - `packages/dto/src/back/auth/`
  - Separate request and response DTOs; filename must be kebab-case:
    - `create-user.request.dto.ts`
    - `create-user.response.dto.ts`
    - `get-user.response.dto.ts`
  - Re-export every DTO through domain index files and main `src/index.ts` (named exports, alphabetical).

- **Naming**
  - DTO class identifier → PascalCase & suffixed with `Dto` and type (`Request`/`Response`)
    - `CreateUserRequestDto`, `CreateUserResponseDto`
    - `GetUsersResponseDto`, `UpdateUserRequestDto`
  - For database entity DTOs, follow: `{Action}{EntityName}{Type}Dto`
    ```typescript
    // Examples
    export class CreateUserRequestDto { }     // ✅ Correct
    export class GetUserResponseDto { }       // ✅ Correct
    export class UpdateOrderRequestDto { }    // ✅ Correct
    export class ListOrdersResponseDto { }    // ✅ Correct
    
    export class UserDto { }                  // ❌ Wrong: missing action and type
    export class createUserDto { }            // ❌ Wrong: not PascalCase
    ```
  - Properties → camelCase with descriptive names
    ```typescript
    export class CreateUserRequestDto {
      @IsEmail()
      email: string;                          // ✅ Correct
      
      @IsString()
      @Length(2, 50)
      firstName: string;                      // ✅ Correct
      
      @IsOptional()
      @IsString()
      lastName?: string;                      // ✅ Correct
    }
    ```

- **Definition Checklist**
  - Use TypeScript `class` with class-validator decorators.
  - Provide JSDoc block for the class and complex properties.
  - Always use appropriate validation decorators from `class-validator`.
  - Use `@IsOptional()` for optional properties.
  - Avoid cross-package imports except for shared enums from `@packages/enum`.
  - Use `@Type()` from `class-transformer` for nested objects and arrays.

- **Validation Requirements**
  - **Request DTOs**: Must validate all input data
    ```typescript
    import { IsEmail, IsString, Length, IsOptional } from 'class-validator';
    
    /**
     * DTO for creating a new user account
     */
    export class CreateUserRequestDto {
      @IsEmail({}, { message: 'Please provide a valid email address' })
      email: string;
      
      @IsString({ message: 'First name must be a string' })
      @Length(2, 50, { message: 'First name must be between 2 and 50 characters' })
      firstName: string;
      
      @IsOptional()
      @IsString({ message: 'Last name must be a string' })
      @Length(2, 50, { message: 'Last name must be between 2 and 50 characters' })
      lastName?: string;
    }
    ```
  - **Response DTOs**: Define expected response structure (no validation needed)
    ```typescript
    /**
     * DTO for user creation response
     */
    export class CreateUserResponseDto {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      createdAt: string;
    }
    ```

- **Nested Objects and Arrays**
  - Use `@Type()` for nested validation
    ```typescript
    import { Type } from 'class-transformer';
    import { IsArray, ValidateNested, IsString } from 'class-validator';
    
    export class CreateOrderRequestDto {
      @IsArray()
      @ValidateNested({ each: true })
      @Type(() => CreateOrderItemRequestDto)
      items: CreateOrderItemRequestDto[];
    }
    
    export class CreateOrderItemRequestDto {
      @IsString()
      productId: string;
      
      @IsNumber()
      @Min(1)
      quantity: number;
    }
    ```
  - **Nested DTO Naming Rules**:
    - For nested objects that represent a single entity: `{Action}{EntityName}{Type}Dto`
      - `CreateOrderItemRequestDto` (for a single order item)
      - `UpdateUserAddressRequestDto` (for a single address)
    - For nested objects that represent a collection: Use the singular form in the parent DTO
      - `items: CreateOrderItemRequestDto[]` (array of order items)
      - `addresses: CreateUserAddressRequestDto[]` (array of addresses)
    - For complex nested structures: Define nested DTOs in the same file as the parent DTO and export them
      - `CreateOrderItemRequestDto` (nested inside `CreateOrderRequestDto`)
      - `CreateUserAddressRequestDto` (nested inside `CreateUserRequestDto`)

- **Boilerplate Template**
  ```typescript
  import { IsString, IsEmail, IsOptional, Length } from 'class-validator';

  /**
   * DTO for [describe the purpose]
   */
  export class [ActionEntityType]Dto {
    @IsString({ message: 'Field must be a string' })
    @Length(1, 100, { message: 'Field must be between 1 and 100 characters' })
    fieldName: string;

    @IsOptional()
    @IsString({ message: 'Optional field must be a string' })
    optionalField?: string;
  }
  ```

- **Domain Index Example (`src/user/index.ts`)**
  ```typescript
  // Request DTOs
  export { CreateUserRequestDto } from './create-user-request.dto';
  export { UpdateUserRequestDto } from './update-user-request.dto';

  // Response DTOs  
  export { CreateUserResponseDto } from './create-user-response.dto';
  export { GetUserResponseDto } from './get-user-response.dto';
  export { GetUsersResponseDto } from './get-users-response.dto';
  ```

- **Main Barrel Example (`src/index.ts`)**
  ```typescript
  // Auth DTOs
  export * from './auth';

  // Order DTOs
  export * from './order';

  // User DTOs
  export * from './user';
  ```

- **Common Validation Patterns**
  ```typescript
  // Email validation
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  // Password validation
  @IsString({ message: 'Password must be a string' })
  @Length(8, 100, { message: 'Password must be between 8 and 100 characters' })
  password: string;

  // UUID validation
  @IsUUID(4, { message: 'Please provide a valid UUID' })
  id: string;

  // Enum validation
  @IsEnum(UserRoleEnum, { message: 'Please provide a valid user role' })
  role: UserRoleEnum;

  // Date validation
  @IsDateString({}, { message: 'Please provide a valid date' })
  birthDate: string;

  // Number validation
  @IsNumber({}, { message: 'Age must be a number' })
  @Min(0, { message: 'Age must be a positive number' })
  @Max(120, { message: 'Age must be less than 120' })
  age: number;

  // Boolean validation
  @IsBoolean({ message: 'Active status must be a boolean value' })
  isActive: boolean;

  // Optional boolean with default value
  @IsOptional()
  @IsBoolean({ message: 'Verified status must be a boolean value' })
  isVerified?: boolean = false;

  // Boolean with custom validation
  @IsBoolean({ message: 'Terms accepted must be a boolean value' })
  @ValidateIf((o) => o.isActive === true, { message: 'Terms must be accepted for active users' })
  termsAccepted: boolean;
  ```

- **Pagination and Sorting DTOs**
  - Pagination and sorting DTOs provide standardized structures for handling data retrieval requests with pagination, sorting, and filtering capabilities. These DTOs ensure consistent API behavior across different endpoints and improve the user experience by allowing clients to control data presentation.
  - **Structure Overview**
    - **Pagination DTOs** typically include:
      - `page`: Current page number (1-based indexing)
      - `limit`: Number of items per page (with reasonable maximum limits)
    - **Sorting DTOs** typically include:
      - `sort`: Field to sort by (enum of allowed sortable fields)
    - **Filtering DTOs** may include:
      - `search`: Text search across multiple fields
      - `filters`: Object containing field-specific filters
      - `dateRange`: Date-based filtering options
  - **Usage Pattern**
    ```typescript
    import { SortEnum } from "@repo/enum";

    export enum getUsersRequestSortEnum {
      createdAt = "user.createdAt",
      username = "user.username",
    }

    export class getUsersRequestDto {
      @IsOptional()
      @IsPositive()
      @Type(() => Number)
      page?: number;

      @IsOptional()
      @IsPositive()
      @Max(30)
      @Type(() => Number)
      limit?: number;

      // other query parameters

      @IsOptional()
      @IsEnum(SortEnum)
      sortType?: SortEnum = SortEnum.DESC;


      @IsOptional()
      @IsEnum(getUsersRequestSortEnum)
      sort?: getUsersRequestSortEnum =
        getUsersRequestSortEnum.createdAt;
    }
    ```

- **Assistant reminders (when this rule is active)**
  - Suggest correct file paths and names for new DTOs based on domain and action.
  - Always include appropriate class-validator decorators.
  - Include JSDoc comments for classes and complex properties.
  - Update domain index files and main `src/index.ts` barrel when new DTOs are added.
  - Ensure Request DTOs have comprehensive validation, Response DTOs define structure.
  - Use meaningful validation messages for better API error responses.
  - Remember to add `@Type()` decorators for nested objects and arrays.

