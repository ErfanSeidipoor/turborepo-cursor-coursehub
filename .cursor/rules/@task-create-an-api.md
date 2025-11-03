---
description: This Cursor rule defines the standards and conventions for creating an API inside a defined backend application using the NestJS framework with Swagger documentation.
globs:
alwaysApply: false
---

# task: create an api (@backend.md)

// This rule defines the standards and conventions for creating API endpoints in any nestjs projects, ensuring consistency, maintainability, and proper documentation using NestJS.

## Inputs Required to Apply This Rule

To implement this rule, provide the following inputs:

- `<APP>`:(required) The name of the NestJS application.
- `<MODULE>`:(required) The name of the module within the application that will define the API functionality.
- `<API_TYPE>`:(required) the type of the API Post,Get, Path, Delete Or Put
- `<API_NAME>`:(required) the name of the api consist of command like `create-user` or query 'get-user'
- `<API-PATH>`:(required) The API path must follow this format: `<APP>/<MODULE>/<API_NAME>`.
  - Use kebab-case for the command or query and action (e.g., `create-user`, `get-user`).
  - The path should clearly indicate whether it is a command (for mutations, e.g., `create`, `update`, `delete`) or a query (for retrieval, e.g., `get`, `list`).
  - Example: `backend/user/create-user` or `backend/order/get-order`.
  - This structure ensures consistency and clarity across all API endpoints, as required by Cursor rules.
- <REQUEST-BODY>:(optional) The shape of the request body expected by the API endpoint, typically defined as a DTO class. Use this input when the endpoint accepts data in the body of the request (e.g., POST, PUT).
- <REQUEST-QUERY>:(optional) The structure of the query parameters accepted by the API endpoint, typically defined as a DTO class. Use this input when the endpoint accepts data via URL query parameters (e.g., GET with filters or pagination).
- <RESPONSE_BODY>:(optional) The structure of the response body returned by the API endpoint, typically defined as a DTO class. Use this input to specify the expected output format of the endpoint.

## Environment Variables

- All environment variables required for database connections, credentials, or configuration **must** be defined in the `.env` file located at the project root directory. If you need to access these environment variables from any subfolder (such as during migration scripts or local development), **copy and paste** the `.env` file into that subfolder to ensure environment variable resolution works as expected. This practice ensures consistency and prevents issues with missing or misconfigured environment variables during migration execution or development tasks.

The following subtasks must be implemented to deliver API endpoints in compliance with this rule:

## Subtasks for API Endpoint Delivery

1. **SUBTASK-1: Check the requirements to implement this task**

- A NestJS application (`<APP>`) and at least one domain module (`<MODULE>`) must be present to implement the API. The application and module names should be specified in the task description. All API logic, controllers, and business rules must be encapsulated within the specified module.
- The `<APP>` and `<API-PATH>` inputs are mandatory for implementing this task. The `<API_NAME>` is used for naming files and variables, while `<API-PATH>` defines the API route within the controller. Ensure both are specified to maintain consistency and clarity in the API structure.
- If any of the required inputs (`<APP>`, `<MODULE>`, `<API_NAME>`, or `<API-PATH>`) are missing, do not proceed with the task. Prompt the user to provide the missing information before continuing.

2. **SUBTASK-2: Build All Packages and Applications Before Implementation**

- Before starting the implementation of any API endpoint, ensure that the entire monorepo builds successfully. This step confirms that all packages and applications are in a valid, compilable state and helps catch any pre-existing build errors.
- Run the following command from the root of the repository to build all packages and applications:
  ```
  pnpm run build
  ```
- If you are working in a subfolder or a different environment, ensure the `.env` file is present in the working directory to provide the necessary environment variables for the build process.
- Only proceed with API development after confirming that all builds have completed successfully and without errors.

3. **SUBTASK-3: Run All Database Migrations Before Implementation**

- Before starting the implementation of any API endpoint, ensure that all database migrations are up to date. This guarantees that the database schema reflects the latest changes and prevents inconsistencies between the codebase and the database.
- Use the migration scripts provided in the `packages/postgres` package to apply all pending migrations.
- The recommended command is:
  ```
  pnpm --filter @repo/postgres run migrate:run
  ```
- If you are working in a subfolder or a different environment, ensure the `.env` file is present in the working directory to provide the necessary environment variables for the migration process.
- Only proceed with API development after confirming that all migrations have been successfully applied.

4. **SUBTASK-4: Select and Apply Example Patterns**

**This section is critical: Reviewing example API implementations is essential to ensure your endpoint follows established best practices and project conventions.**

- Before implementing your API, carefully study the example files in the `.cursor/rules/example-create-an-api` directory.
- Each example provides a proven pattern for common API scenarios.
- Select the example(s) that most closely match your intended API type and use their structure, naming, and conventions as a template for your implementation.
- Adhering to these examples is mandatory to maintain consistency, reliability, and clarity across all API endpoints in the project.
  - `.cursor/rules/example-create-an-api/@get-list-of-object.md`: Example for retrieving a list of objects, supporting pagination, sorting, and filtering.
  - `.cursor/rules/example-create-an-api/@get-an-object-by-id.md`: Example for retrieving a single object by its unique identifier.
  - `.cursor/rules/example-create-an-api/@create-an-object.md`: Example for creating a new entity (object) in the system, including request/response DTOs, command/handler, and controller patterns.

- Use the description provided in each example file to help you choose the most appropriate pattern for your API implementation.

5. **SUBTASK-5: Create Request and Response DTOs in the @repo/dtos Module**

- All request and response DTOs for API endpoints must be defined in the `@repo/dtos` package, located at:  
   `packages/dtos/src/<APP>/<MODULE>/`
- This package is shared between backend and frontend applications.  
  **Do not** use Swagger decorators in these DTOs—use only `class-validator` and `class-transformer` decorators for validation and transformation.
  - For each API endpoint, create up to two files (use kebab-case for filenames):
    - `<API_NAME>.request.dto.ts`
      - Defines the DTO for the request body or query parameters.
      - Full path: `packages/dtos/src/<APP>/<MODULE>/<API_NAME>.request.dto.ts`
    - `<API_NAME>.response.dto.ts`
      - Defines the DTO for the response body.
      - Full path: `packages/dtos/src/<APP>/<MODULE>/<API_NAME>.response.dto.ts`
  - In some cases, an endpoint may not require a request or response DTO (e.g., a path-only parameter or a void response). Omit the unnecessary file in these cases.
  - **DTO Naming Conventions**
  - Class names must use PascalCase, `<API_NAME>` suffixed with `RequestDto` or `ResponseDto` as appropriate.
    - Examples: `CreateUserRequestDto`, `CreateUserResponseDto`, `GetUsersResponseDto`, `UpdateOrderRequestDto`, `ListOrdersResponseDto`
  - Do **not** use generic or ambiguous names such as `UserDto` or non-PascalCase names like `createUserDto`.
  - The class name for each DTO must follow one of these patterns: `<API_NAME>RequestDto` for request DTOs and `<API_NAME>ResponseDto` for response DTOs.

  ```typescript
  // ✅ Correct
  export class CreateUserRequestDto {}

  export class GetUserResponseDto {}

  export class UpdateOrderRequestDto {}

  export class ListOrdersResponseDto {}

  // ❌ Incorrect
  export class UserDto {} // Missing action and type
  export class createUserDto {} // Not PascalCase
  ```

  - All DTO property names must use camelCase and be descriptive.
  - Use `class-validator` decorators for validation and `class-transformer` for transformation as needed.

  ```typescript
  export class CreateUserRequestDto {
    @IsEmail()
    email: string;

    @IsString()
    @Length(2, 50)
    firstName: string;

    @IsOptional()
    @IsString()
    lastName?: string;
  }
  ```

  - Special cases:
    - If the API endpoint only uses path parameters (e.g., `api/product/:productId`), a request DTO is not required.
    - If the API endpoint does not return a response body (e.g., `backend/start-workflow/:workflowId`), a response DTO is not required.

  - For comprehensive and authoritative guidelines on defining DTOs within the dtos package, refer to the dedicated rule file: `packages/dtos/.cursor/rules/@dtos.mdc`
  - Ensure all DTO classes are exported from an `index.ts` file located in `packages/dtos/src/<APP>/<MODULE>/index.ts`.
  - If the `index.ts` file does not exist, create it and export all DTOs defined in that module.

- **Entity Return Convention:**  
  When an API endpoint needs to return a database entity (such as `User`), the response DTO should directly expose the entity as a property, without mapping or transforming its fields to separate DTO properties.
  - **Example:**  
    If returning a `User` entity from the `@repo/postgres` package, the response DTO should look like:

    ```typescript
    import { User } from '@repo/postgres';

    export class GetUserResponseDto {
      user: User;
    }
    ```

  - This approach ensures consistency, reduces boilerplate, and leverages the existing entity definitions for type safety and documentation.
  - Use this pattern for endpoints that return a single entity or a list of entities, unless there is a specific need to hide or transform certain fields for security or API design reasons.
  - If sensitive fields (such as passwords) exist on the entity, ensure they are excluded from the response (e.g., by using serialization options or custom DTOs as needed).

- **IMPORTANT:** After making any changes to DTOs, you must rebuild the `@repo/dtos` package to ensure that the changes are available to all applications and modules that depend on it.
  - Run `npm run build` (or `pnpm build`) in the `packages/dtos` directory after each change to DTOs.
  - This step is required to propagate updates and prevent runtime or type errors due to stale builds.

6. **SUBTASK-6: Create Request and Response DTOs in the `apps/<APP>/src/modules/<MODULE>/dtos` Module**

- All request and response DTOs for API endpoints must be defined again in the `apps/<APP>/src/modules/<MODULE>/dtos` and extends from dtos that defined from previous subtask (subtask2) here `packages/dtos/src/<APP>/<MODULE>/`
- These DTOs only use for defenition if controller
  **only use** Swagger decorators in these DTOs—use only `import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"`;
- For each API endpoint, create up to two files (use kebab-case for filenames):
- `<API_NAME>.request.dto.ts`
  - Defines the DTO for the request body or query parameters.
  - Full path: `apps/<APP>/src/modules/<MODULE>/dtos/<API_NAME>.request.dto.ts`
- `<API_NAME>.response.dto.ts`
  - Defines the DTO for the response body.
  - Full path: `apps/<APP>/src/modules/<MODULE>/dtos/<API_NAME>.response.dto.ts`
- In some cases, an endpoint may not require a request or response DTO (e.g., a path-only parameter or a void response). Omit the unnecessary file in these cases.
- **DTO Naming Conventions**
  - Class names must use PascalCase, suffixed with `RequestDtoAPI` or `ResponseDtoAPI` as appropriate.
  - Examples: `CreateUserRequestDtoAPI`, `CreateUserResponseDtoAPI`, `GetUsersResponseDtoAPI`, `UpdateOrderRequestDtoAPI`, `ListOrdersResponseDtoAPI`
  - Do **not** use generic or ambiguous names such as `UserDto` or non-PascalCase names like `createUserDto`.
  - The class name for each DTO must follow one of these patterns: `<API_NAME>RequestDtoAPI` for request DTOs and `<API_NAME>ResponseDtoAPI` for response DTOs.

  ```typescript
  // ✅ Correct
  export class CreateUserRequestDtoAPI {}

  export class GetUserResponseDtoAPI {}

  export class UpdateOrderRequestDtoAPI {}

  export class ListOrdersResponseDtoAPI {}

  // ❌ Incorrect
  export class UserDto {} // Missing action and type
  export class createUserDto {} // Not PascalCase
  ```

  - All DTO property names must use camelCase and be descriptive.
  - Use `class-validator` decorators for validation and `class-transformer` for transformation as needed.

  ```typescript
  import { CreateUserRequestDto } from '@repo/dtos';
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

  export class CreateUserRequestDtoAPI extends CreateUserRequestDto {
    @ApiProperty()
    email: string;

    @ApiProperty()
    firstName: string;

    @ApiPropertyOptional()
    lastName?: string;
  }
  ```

- Special cases:
  - If the API endpoint only uses path parameters (e.g., `api/product/:productId`), a request DTO is not required.
  - If the API endpoint does not return a response body (e.g., `backend/start-workflow/:workflowId`), a response DTO is not required.

- For comprehensive and authoritative guidelines on defining DTOs within the dtos package, refer to the dedicated rule file: `apps/.cursor/rules/@backend.mdc`
- Ensure all DTO classes are exported from an `index.ts` file located in `apps/<APP>/src/modules/<MODULE>/dtos/index.ts`.
- If the `index.ts` file does not exist, create it and export all DTOs defined in that module.

7. **SUBTASK-7: Define Command or Query Classes for CQRS**

- **Purpose:**  
  For each API endpoint, determine if the operation is a data mutation (command) or a data retrieval (query), and create the appropriate class in the correct location.

- **How to Decide:**
  - Use a **command** for operations that create, update, or delete data.
  - Use a **query** for operations that fetch or list data.

- **File Structure:**
  - Place command classes in:  
    `apps/<APP>/src/modules/<MODULE>/commands/impl/`
  - Place query classes in:  
    `apps/<APP>/src/modules/<MODULE>/queries/impl/`
  - Each of these directories must include an `index.ts` file that exports all classes in that directory.

- **File Naming:**
  - Use kebab-case for filenames.
    - Command: `<api-name>.command.ts` full path: `apps/<APP>/src/modules/<MODULE>/commands/impl/<api-name>.command.ts`
    - Query: `<api-name>.query.ts` full path: `apps/<APP>/src/modules/<MODULE>/queries/impl/<api-name>.query.ts`

- **Class Naming Conventions:**
  - **Commands:**
    - Use PascalCase, suffixed with `Command`.
    - Example: `CreateUserCommand`, `UpdateOrderCommand`
    - Do **not** use ambiguous or non-PascalCase names (e.g., `CreateUser`, `updateOrder`).
  - **Queries:**
    - Use PascalCase, suffixed with `Query`.
    - Example: `GetUsersQuery`, `ListOrdersQuery`
    - Do **not** use ambiguous or non-PascalCase names (e.g., `GetUser`, `listOrders`).

  ```typescript
  // ✅ Correct
  export class GetUserQuery {}
  export class ListOrdersQuery {}
  export class CreateUserCommand {}
  export class UpdateOrderCommand {}

  // ❌ Incorrect
  export class GetUser {} // Missing action and type
  export class ListOrders {} // Not PascalCase
  export class createUserCommand {} // Not PascalCase
  ```

- **Constructor Parameters:**
  - Each command or query class must include all parameters required by the handler, such as:
    - The corresponding `<API_NAME>RequestDtoAPI` (for body or query parameters)
    - Path parameters (e.g., `userId`, `campaignId`)
    - User ID from JWT token (if required)
  - All property names must use camelCase and be descriptive.

  ```typescript
  // Example for a query
  import { GetCampaignsRequestDtoAPI } from '../../dtos';

  export class GetCampaignsQuery {
    constructor(
      public readonly userId: string, // from JWT token
      public readonly platformId: string, // from URL path
      public readonly getCampaignsRequestDtoAPI: GetCampaignsRequestDtoAPI, // query/body parameters
    ) {}
  }
  ```

  ```typescript
  // Example for a command
  import { GenerateCampaignSummaryRequestDtoAPI } from '../../dtos';

  export class GenerateCampaignSummaryCommand {
    constructor(
      public readonly userId: string, // from JWT token
      public readonly campaignId: string, // from URL path
      public readonly generateCampaignSummaryRequestDtoAPI: GenerateCampaignSummaryRequestDtoAPI, // body parameters
    ) {}
  }
  ```

  ```typescript
  // Template for a query
  export class <API_NAME>Query {
    constructor(
      public readonly userId: string,
      public readonly parameter1: string,
      public readonly <API_NAME>RequestDtoAPI: <API_NAME>RequestDtoAPI,
    ) {}
  }

  // Template for a command
  export class <API_NAME>Command {
    constructor(
      public readonly userId: string,
      public readonly parameter1: string,
      public readonly <API_NAME>RequestDtoAPI: <API_NAME>RequestDtoAPI,
    ) {}
  }
  ```

8. **SUBTASK-8: Define the Handler Class for CQRS**

- **Purpose:**  
  For each API endpoint, determine if the operation is a data mutation (command) or a data retrieval (query), and create the appropriate class in the correct location.

- **How to Decide:**
  - Use a **command** for operations that create, update, or delete data.
  - Use a **query** for operations that fetch or list data.

- **File Structure:**
  - Place command handler classes in:  
    `apps/<APP>/src/modules/<MODULE>/commands/handlers/`
  - Place query classes in:  
    `apps/<APP>/src/modules/<MODULE>/queries/handlers/`
  - Each of these directories must include an `index.ts` file that exports all classes in that directory.

  ```typescript
  // Example for a Command handlers in: apps/<APP>/src/modules/<MODULE>/commands/handlers/index.ts
  import { CreateUserHandler } from './create-user.handler';
  import { UpdateUserHandler } from './update-user.handler';
  import { DeleteUserHandler } from './delete-user.handler';

  export const commandHandlers = [
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
  ];
  ```

  ```typescript
  // Example for a Query handlers in: apps/<APP>/src/modules/<MODULE>/queries/handlers/index.ts
  import { GetUsersHandler } from './get-users.handler';
  import { GetUserById } from './get-user-by-id.handler';

  export const queryHandlers = [GetUsersHandler, GetUserById];
  ```

- **File Naming:**
  - Use kebab-case for filenames.
    - Command: `<api-name>.handler.ts` full path: `apps/<APP>/src/modules/<MODULE>/commands/handlers/<api-name>.handler.ts`
    - Query: `<api-name>.handler.ts` full path: `apps/<APP>/src/modules/<MODULE>/queries/handlers/<api-name>.handler.ts`

- **Class Naming Conventions:**
  - **Command Handlers:**
    - Use PascalCase, suffixed with `Handler`.
    - Example: `CreateUserHandler`, `UpdateOrderHandler`
    - Do **not** use ambiguous or non-PascalCase names (e.g., `CreateUser`, `updateOrder`).
  - **Query Handlers:**
    - Use PascalCase, suffixed with `Handler`.
    - Example: `GetUsersHandler`, `ListOrdersHandler`
    - Do **not** use ambiguous or non-PascalCase names (e.g., `GetUser`, `listOrders`).

    ```typescript
    // ✅ Correct
    export class GetUserHandler {}
    export class ListOrdersHandler {}
    export class CreateUserHandler {}
    export class UpdateOrderHandler {}

    // ❌ Incorrect
    export class GetUser {} // Missing action and type
    export class ListOrders {} // Not PascalCase
    export class createUserHandler {} // Not PascalCase
    ```

- **Constructor Parameters:**
  - Each command or query handler class must receive, via its constructor, all required dependencies (such as services from `@repo/backend-modules-*`) needed to fulfill its logic. Do not inject repositories or entities directly; always use the appropriate service abstraction.

  - The handler's constructor parameters must match the services required to implement the command or query logic. Do not leave the constructor empty.

  - The handler should destructure the command or query object in the `execute` method to access its properties.

  - Always import only the necessary services from `@repo/backend-modules-*` packages. If a new method is needed, add it to the appropriate service in the backend module, not in the handler.

  - Do not access database entities or repositories directly in the handler. Use the service layer.

  - Example of a properly structured command handler:

  ```typescript
  import { <API_NAME>Command } from '../impl';
  import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
  import { Transactional } from 'typeorm-transactional';
  import { UserService } from '@repo/backend-modules-postgres';
  import { JwtService } from '@repo/backend-modules-jwt';

  @CommandHandler(<API_NAME>Command)
  export class <API_NAME>Handler implements ICommandHandler<<API_NAME>Command> {
    constructor(
      private readonly userService: UserService,
      private readonly jwtService: JwtService,
    ) {}

    @Transactional()
    async execute(command: <API_NAME>Command): Promise<<API_NAME>ResponseAPI> {
      const { /* destructure command properties here */ } = command;

      // Handler logic using injected services
    }
  }
  ```

  // Example of a properly structured query handler:

  ```typescript
  import { <API_NAME>Query } from '../impl';
  import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
  import { UserService } from '@repo/backend-modules-postgres';

  @QueryHandler(<API_NAME>Query)
  export class <API_NAME>Handler implements IQueryHandler<<API_NAME>Query> {
    constructor(
      private readonly userService: UserService,
    ) {}

    async execute(query: <API_NAME>Query): Promise<<API_NAME>ResponseAPI> {
      const { /* destructure query properties here */ } = query;

      // Handler logic using injected services
    }
  }
  ```

  - Handlers must only depend on and import service classes from backend modules located in `packages/backend-modules/*`. Handlers must never directly access database entities, repositories, or any low-level persistence logic (such as TypeORM repositories or entities from `@repo/postgres`).

  - Always inject required services from backend modules via the constructor, Never inject repositories or entities directly.
  - If a handler requires new business logic, add the method to the appropriate
    service in the backend module, then use that service method in the handler.

  ```typescript
  // ✅ Correct: Only services from backend modules are imported and injected.
  import { UserService } from '@repo/backend-modules-postgres';
  import { JwtService } from '@repo/backend-modules-jwt';

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  ```

  ```typescript
  // ❌ Incorrect: Directly importing and injecting repositories or entities.
  import { Repository } from 'typeorm';
  import { User } from '@repo/postgres';

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}
  ```

  - If a handler needs a new method from a backend module, implement that method in the corresponding service within `packages/backend-modules/*` and then use the service in the handler.

  - **IMPORTANT:** After making any changes to DTOs, you must rebuild the `packages/backend-modules/*` package to ensure that the changes are available to all applications and modules that depend on it.

9. **SUBTASK-9: Define the controller for API**

- the controller should exists ot defines here `apps/<APP>/src/modules/<MODULE>/{MODULE}.controller.ts` (Use kebab-case for naming the files)
- also the module should exists or defines here `apps/<APP>/src/modules/<MODULE>/{MODULE}.module.ts`(Use kebab-case for naming the files)

- example of the controller is here:

```typescript

  import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
  } from "@nestjs/common";
  import { CommandBus, QueryBus } from "@nestjs/cqrs";
  import { USER_NOT_FOUND, USER_EMAIL_ALREADY_EXISTS } from "@repo/@repo/http-errors"

  import {
    <API_NAME>RequestAPI,
  } from "./dtos";

  import {
    <API_NAME>Command,
  } from "./commands/impl";


  @ApiTags('<MODULE>')
  @Controller()
  export class <MODULE>Controller {

    constructor(
      private readonly queryBus: QueryBus,
      private readonly commandBus: CommandBus
    ) {}

  // COMMAND EXAMPLE
    @<API-TYPE>("<API-PATH>") //user API-PATH to Fill this input
    @ApiOperation({
      summary: '<A SUMMARY OF THE API>',
      description:
        '<A DESCRIPTION ABOUT THE API AND  FUNCTIONALITY THAT IMPLEMENTED INSIDE THE HANDLER>',
    })
    @ApiResponse({
      status: HttpStatus.OK,
      type: <API_NAME>ResponseDtoAPI,
    })
    // PUT OTHER ERRORs INSIDE THE HANDLERS FROM `@repo/http-errors`
    @ApiResponse(USER_EMAIL_ALREADY_EXISTS)
    @ApiResponse(USER_NOT_FOUND)
    <API_NAME>(
      @Body() body: <API_NAME>RequestDtoAPI, // if this request has request body
      @UserId() userId: string, // i need userId inside the command
      @Param("param1") param1: string //  if param exist inside the api-path
    ):Promise<<API_NAME>ResponseDtoAPI>  {
      return this.commandBus.execute(
        new <API_NAME>Command(
          // example:
          // userId,param1,body
        )
      );
    }


  // QUERY EXAMPLE
    @<API-TYPE>('<API-PATH>') //user API-PATH to Fill this input
    @ApiOperation({
        summary: '<A SUMMARY OF THE API>',
        description:
          '<A DESCRIPTION ABOUT THE API AND  FUNCTIONALITY THAT IMPLEMENTED INSIDE THE HANDLER>',
    })
    @ApiResponse({
      status: HttpStatus.OK,
    type: <API_NAME>ResponseDtoAPI,
    })
    @ApiResponse(USER_NOT_FOUND)
    async getUser(
      @UserId() userId: string,
      @Query() query: <API_NAME>RequestDtoAPI, // if this request has request body
      @Param("param1") param1: string //  if param exist inside the api-path
    ):Promise<<API_NAME>ResponseDtoAPI> {
      return this.queryBus.execute(
        new <API_NAME>Query(userId,
          // example: param1, query
        )
      );
    }
  }
```

For controllers that require extracting the userId from the JWT token, always apply both of the following decorators to the controller method:

1.  `@ApiBearerAuth()` from `@nestjs/swagger` to document the need for a Bearer token in Swagger/OpenAPI.
2.  `@UseGuards(AuthGuard('jwt'))` from `@nestjs/common` to enforce JWT authentication.

Example usage:

```ts
import { ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
```

To access the userId extracted from the JWT in your handler/controller method, use the `@UserId()` custom decorator from `@repo/back-share`:

```ts
import { UserId } from '@repo/back-share';

someHandler(
@UserId() userId: string,
...other parameters
) { ... }
```

10. **SUBTASK-10: Create the Module if Not Already Present**

- Each API must be encapsulated within a NestJS module located at `apps/<APP>/src/modules/<MODULE>/<MODULE>.module.ts`.
- If the module file does not exist, create it using the following conventions:
  - The module file must be named in kebab-case: `<MODULE>.module.ts`.
  - The module class must use PascalCase and be suffixed with `Module`. Example: `UserModule`.
  - The module must import and provide all command/query handlers, controllers, and any required providers.
  - Register the module in the application's `app.module.ts` if not already present.

- **Example module file:**

```ts
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { <MODULE>Controller } from "./{MODULE}.controller";

import { queryHandlers } from "./queries/handler";
import { commandHandlers } from "./commands/handler";


@Module({
  imports: [
    CqrsModule,
    // Add any additional modules required by your handlers below.
    // Example: PostgresModule   // from @repo/backend-modules-postgres
    // Example: JwtModule       //  from @repo/backend-modules-jwt
  ],
  controllers: [...controllers],
  providers: [
    ...queryHandlers,
    ...commandHandlers,
  ],
})
export class <MODULE>Module {}

```

11. **SUBTASK-11: Register the Module in the Main Application Module**

- After creating your module, ensure it is imported and registered in the main application module located at `apps/<APP>/src/app.module.ts`.
- The import path should use the correct relative path to your module file.
- Add your module to the `imports` array of the `@Module` decorator in `app.module.ts`.

- **Example:**

```ts

import { <MODULE>Module } from './modules/<MODULE>/<MODULE>.module';

@Module({
  imports: [
    // Add your new module here in alphabetical order with other modules in the imports array.
    <MODULE>Module,
    // ...other existing modules
  ],
  // other parameters such as controllers and providers below as required by your application.
})
export class AppModule {}
```

12. **SUBTASK-12: Review Your Code for Compliance with General Rules**

- Before finalizing your changes, carefully review your code to ensure it follows all general coding standards and best practices defined in `.cursor/rules/@general-rules.md`.

13. **SUBTASK-13: Build All Packages and Applications to Verify Integration**

- To ensure that all packages and applications in the monorepo build and integrate correctly, run the following command from the root of your repository: `npm run build`

14. **SUBTASK-14: Verify Application Startup and Routing**

- If you encounter environment variable issues when starting the application, copy and paste the `.env` file from the root directory to `./apps/<APP>/`. This ensures all required environment variables are available during development.
- After copying the `.env` file, start the application in development mode using:
  ```
  pnpm -w --filter <APP> dev
  ```
- This practice helps prevent configuration errors and ensures a smooth development experience.
- Confirm that the global prefix is set to `<APP>`.
- Verify that the application is accessible at:  
  `http://localhost:<PORT>/<APP>`
