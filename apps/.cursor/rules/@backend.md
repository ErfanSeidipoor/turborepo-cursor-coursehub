---
description: This rule defines the standards and conventions for all backend projects using NestJS framework with Swagger documentation.
globs:
alwaysApply: false
---

# Backend Rules (@backend.md)

This rule defines the standards and conventions for all backend projects using NestJS framework with Swagger documentation.

- **Backend Rules (@backend.md)**
  - This rule defines the standards and conventions for all backend projects using NestJS framework with Swagger documentation.

- **Framework Requirements**
  - **Framework**: NestJS with TypeScript
  - **Documentation**: Swagger/OpenAPI integration required
  - **Architecture**: Domain-driven design with CQRS pattern
  - **Package Manager**: PNPM (monorepo consistency)

- **Application Configuration**
  - **Global Prefix**
    - The `globalPrefix` must be the application name
    - Examples: `api`, `back`, `core`, `admin`, `auth`
    - Set in `@main.ts` (`@main.ts`): `app.setGlobalPrefix('api')`
  - **Port Configuration**
    - Use `PORT` environment variable when available
    - Default port assignment:
      - First backend app: `4000`
      - Second backend app: `4001`
      - Third backend app: `4002`
      - And so on...
    - **Implementation Example (`@main.ts`)**
      ```typescript
      // ✅ DO: Use the PORT environment variable with a default value.
      const port = process.env.PORT || 4000;
      ```

- **Transactional Context Initialization**
  - To ensure proper transactional context, the `initializeTransactionalContext` function must be called at the beginning of the `bootstrap` function.
  - **Example (`@main.ts`)**

    ```typescript
    // ✅ DO: Initialize the transactional context at the very start of the application.
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';
    import { initializeTransactionalContext } from '@repo/backend-modules-postgres/initialize-transactional-context';

    async function bootstrap() {
      initializeTransactionalContext();
      const app = await NestFactory.create(AppModule);
      // ... rest of the bootstrap logic
      const port = process.env.PORT || 4000;
      await app.listen(port);
    }
    bootstrap();
    ```

- **Module Structure**
  - **Domain-Based Modules**
    - Each module represents a business domain.
    - Module name should be the domain name in kebab-case.
    - API path should be the domain name.
    - **Examples**
      - `users` module → `/api/users`
      - `order-management` module → `/api/order-management`
      - `inventory` module → `/api/inventory`
  - **Module Directory Structure**
    ```
    src/
    ├── modules/
    │   └── {domain-name}/
    │       ├── {domain-name}.module.ts
    │       ├── {domain-name}.controller.ts
    │       ├── commands/
    │       │   ├── impl/
    │       │   │   ├── index.ts
    │       │   │   ├── create-{entity}.command.ts
    │       │   │   ├── update-{entity}.command.ts
    │       │   │   └── delete-{entity}.command.ts
    │       │   └── handlers/
    │       │       ├── index.ts
    │       │       ├── create-{entity}.handler.ts
    │       │       ├── update-{entity}.handler.ts
    │       │       └── delete-{entity}.handler.ts
    │       ├── queries/
    │       │   ├── impl/
    │       │   │   ├── index.ts
    │       │   │   ├── get-{entity}.query.ts
    │       │   │   ├── get-{entities}.query.ts
    │       │   │   └── find-{entity}-by-id.query.ts
    │       │   └── handlers/
    │       │      ├── index.ts
    │       │       ├── get-{entity}.handler.ts
    │       │       ├── get-{entities}.handler.ts
    │       │       └── find-{entity}-by-id.handler.ts
    │       └── dtos/
    │           ├── index.ts
    │           │── create-{entity}.request.dto.ts
    │           │── update-{entity}.request.dto.ts
    │           │── {entity}-query.request.dto.ts
    │           │── {entity}.response.dto.ts
    │           │── {entity}-list.response.dto.ts
    │           └── {entity}-detail.response.dto.ts
    ```
  - **Index Files (`@index.ts`)**
    - **Purpose**: Export all files from each directory for clean imports.
    - **Location**: Every directory should have an `@index.ts` file.
    - **Structure**: Export all files in alphabetical order.
  - **Index Files Examples**
    - **Commands Implementation Index (`@commands/impl/index.ts`)**
      ```typescript
      // ✅ DO: Export all commands from the implementation directory.
      export { CreateUserCommand } from './create-user.command';
      export { UpdateUserCommand } from './update-user.command';
      export { DeleteUserCommand } from './delete-user.command';
      ```
    - **Commands Handler Index (`@commands/handlers/index.ts`)**

      ````typescript
      // ✅ DO: Export all command handlers and a composite array.
      export * from './create-user.handler';
      export * from './update-user.handler';
      export * from './delete-user.handler';

      /**
       * Command handlers for user operations.
       *
       * This array exports all command handlers that process write operations
       * (Create, Update, Delete) for the user domain. These handlers are
       * automatically registered with the CQRS CommandBus and contain the
       * business logic for user management operations.
       *
       * @description Handlers for user CRUD operations
       * @example
       * ```typescript
       * // In module registration
       * providers: [
       *   ...commandHandlers,
       *   // other providers
       * ]
       * ```
       */
      import { CreateUserHandler } from './create-user.handler';
      import { UpdateUserHandler } from './update-user.handler';
      import { DeleteUserHandler } from './delete-user.handler';

      export const commandHandlers = [
        CreateUserHandler,
        UpdateUserHandler,
        DeleteUserHandler,
      ];
      ````

    - **Queries Implementation Index (`@queries/impl/index.ts`)**
      ```typescript
      // ✅ DO: Export all queries from the implementation directory.
      export { GetUserByIdQuery } from './get-user-by-id.query';
      export { GetUsersQuery } from './get-users.query';
      export { FindUserByEmailQuery } from './find-user-by-email.query';
      ```
    - **Queries Handler Index (`@queries/handlers/index.ts`)**

      ````typescript
      // ✅ DO: Export all query handlers and a composite array.
      export * from './get-user-by-id.handler';
      export * from './get-users.handler';
      export * from './find-user-by-email.handler';

      /**
       * Query handlers for user operations.
       *
       * This array exports all query handlers that process write operations
       * (Read operations) for the user domain. These handlers are
       * automatically registered with the CQRS QueryBus and contain the
       * business logic for user management operations.
       *
       * @description Handlers for user CRUD operations
       * @example
       * ```typescript
       * // In module registration
       * providers: [
       *   ...queryHandlers,
       *   // other providers
       * ]
       * ```
       */

      import { GetUserByIdHandler } from './get-user-by-id.handler';
      import { GetUsersHandler } from './get-users.handler';
      import { GetUserByEmailHandler } from './get-user-by-email.handler';

      export const queryHandlers = [
        GetUserByIdHandler,
        GetUsersHandler,
        GetUserByEmailHandler,
      ];
      ````

- **CQRS Implementation**
  - **Commands**
    - **Purpose**: Handle write operations (Create, Update, Delete).
    - **Location**: `modules/{domain}/commands/`.
    - **Structure**:
      - `impl/`: Command classes defining the data structure.
      - `handlers/`: Command handlers containing business logic.
    - **Command Implementation (`@create-user.command.ts`)**
      ```typescript
      // ✅ DO: Define command classes with readonly properties.
      export class CreateUserCommand {
        constructor(
          public readonly createUserRequestDto: CreateUserRequestDto,
        ) {}
      }
      ```
    - **Command Handler (`@create-user.handler.ts`)**

      ```typescript
      // ✅ DO: Implement command handlers with business logic.
      @CommandHandler(CreateUserCommand)
      export class CreateUserHandler
        implements ICommandHandler<CreateUserCommand>
      {
        constructor(private readonly userService: UserService) {}

        async execute(
          command: CreateUserCommand,
        ): Promise<CreateUserResponseDto> {
          // Business logic implementation
        }
      }
      ```

  - **Queries**
    - **Purpose**: Handle read operations (Get, Find, List).
    - **Location**: `modules/{domain}/queries/`.
    - **Structure**:
      - `impl/`: Query classes defining the data structure.
      - `handlers/`: Query handlers containing data retrieval logic.
    - **Query Implementation (`@get-user-by-id.query.ts`)**
      ```typescript
      // ✅ DO: Define query classes with readonly properties.
      export class GetUserByIdQuery {
        constructor(public readonly userId: string) {}
      }
      ```
    - **Query Handler (`@get-user-by-id.handler.ts`)**

      ```typescript
      // ✅ DO: Implement query handlers with data retrieval logic.
      @QueryHandler(GetUserByIdQuery)
      export class GetUserByIdHandler
        implements IQueryHandler<GetUserByIdQuery>
      {
        constructor(private readonly userService: UserService) {}

        async execute(
          query: GetUserByIdQuery,
        ): Promise<GetUserByIdResponseDto> {
          // Data retrieval logic
        }
      }
      ```

- **DTO Standards**
  - **Requirements**
    - All DTOs must extend from `packages/dtos`.
    - All DTOs must JUST include Swagger decorators.
    - Separate request and response DTOs.
    - Use Swagger decorators for API documentation only.
  - **Request DTOs (`@dtos/requests/`)**
    - **Purpose**: Define API request data structures with Swagger documentation.
    - **Naming Convention**: Same name as packages/dtos + "API" suffix.
    - **Requirements**:
      - Must extend the corresponding DTO from `packages/dtos`.
      - Must include Swagger decorators for API documentation.
      - Should maintain the same property structure as the base DTO.
    - **Example (`@create-user.request.dto.ts`)**

      ```typescript
      // ✅ DO: Extend base DTOs and add Swagger decorators.
      import { CreateUserRequestDto } from 'packages/dtos';
      import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
      import { UserRoleEnum } from 'packages/enums';

      export class CreateUserRequestDtoAPI extends CreateUserRequestDto {
        @ApiProperty({
          description: 'User email address',
          example: 'user@example.com',
        })
        @IsEmail()
        email: string;

        @ApiPropertyOptional({
          description: 'User full name',
          example: 'John Doe',
        })
        name?: string;

        @ApiProperty({
          description: 'User role',
          enum: UserRoleEnum,
          example: UserRoleEnum.REGULAR_USER,
        })
        role: UserRoleEnum;
      }
      ```

  - **Response DTOs (`@dtos/responses/`)**
    - **Example (`@create-user.response.dto.ts`)**

      ```typescript
      // ✅ DO: Define response DTOs with Swagger decorators for clear API contracts.
      import { CreateUserResponseDto } from 'packages/dtos';
      import { ApiProperty } from '@nestjs/swagger';
      import { UserRoleEnum } from 'packages/enums';

      export class CreateUserResponseDtoAPI extends CreateUserResponseDto {
        @ApiProperty({
          description: 'User unique identifier',
          example: '123e4567-e89b-12d3-a456-426614174000',
        })
        id: string;

        @ApiProperty({
          description: 'User email address',
          example: 'user@example.com',
        })
        email: string;

        @ApiProperty({
          description: 'User full name',
          example: 'John Doe',
        })
        name: string;

        @ApiProperty({
          description: 'User role',
          enum: UserRoleEnum,
          example: UserRoleEnum.REGULAR_USER,
        })
        role: UserRoleEnum;

        @ApiProperty({
          description: 'User creation timestamp',
          example: '2024-01-01T00:00:00.000Z',
        })
        createdAt: Date;

        @ApiProperty({
          description: 'User last update timestamp',
          example: '2024-01-01T00:00:00.000Z',
        })
        updatedAt: Date;
      }
      ```

- **Controller Standards**
  - **Implementation Requirements**
    - Use Swagger decorators for API documentation.
    - Implement proper HTTP status codes.
    - Use dependency injection for commands and queries.
    - Include error handling.
  - **Example (`@user.controller.ts`)**

    ```typescript
    // ✅ DO: Implement controllers with Swagger documentation and CQRS buses.
    @ApiTags('user')
    @Controller('user')
    export class UsersController {
      constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
      ) {}

      @Post()
      @ApiOperation({ summary: 'Create a new user' })
      @ApiResponse({
        status: 201,
        description: 'User created successfully',
        type: CreateUserResponseDtoAPI,
      })
      async createUser(
        @Body() createUserRequestDto: CreateUserRequestDtoAPI,
      ): Promise<CreateUserResponseDtoAPI> {
        return this.commandBus.execute(
          new CreateUserCommand(createUserRequestDto),
        );
      }

      @Get(':userId')
      @ApiOperation({ summary: 'Get user by ID' })
      @ApiParam({
        name: 'userId',
        description: 'User unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
      })
      @ApiResponse({
        type: GetUserByIdResponseDto,
      })
      @ApiResponse({
        status: 404,
        description: 'User not found',
      })
      async getUserById(
        @Param('userId') userId: string,
      ): Promise<GetUserByIdResponseDto> {
        return this.queryBus.execute(new GetUserByIdQuery(userId));
      }
    }
    ```

- **Module Registration**
  - **Module Structure Example (`@users.module.ts`)**

    ```typescript
    // ✅ DO: Register command and query handlers in the module.
    import { queryHandlers } from './queries/handlers';
    import { commandHandlers } from './commands/handlers';

    @Module({
      imports: [CqrsModule],
      controllers: [UsersController],
      providers: [
        ...commandHandlers,
        ...queryHandlers,
        // Services
        UserService,
      ],
    })
    export class UsersModule {}
    ```

- **Swagger Configuration**
  - **Main Application Setup (`@main.ts`)**

    ```typescript
    // ✅ DO: Configure Swagger and global pipes in the main application file.
    import { Logger, ValidationPipe } from '@nestjs/common';
    import { NestFactory } from '@nestjs/core';
    import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
    import { AppModule } from './app.module';

    async function bootstrap() {
      const app = await NestFactory.create(AppModule);

      // Set global prefix >> The `globalPrefix` must be the application name for example here is api
      const globalPrefix = 'api';
      app.setGlobalPrefix(globalPrefix);

      // Swagger configuration
      const config = new DocumentBuilder()
        .setTitle('API Documentation')
        .setDescription('The API description')
        .setVersion('1.0')
        .addTag(globalPrefix)
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup(globalPrefix + '/docs', app, document);

      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          transform: true,
          transformOptions: {
            enableImplicitConversion: true,
          },
          forbidUnknownValues: true,
        }),
      );

      // Port configuration
      const port = process.env.PORT || 4000;
      await app.listen(port);

      Logger.log(
        `Application is running on: http://localhost:${port}/${globalPrefix}`,
      );
      Logger.log(
        `Swagger documentation: http://localhost:${port}/${globalPrefix}/docs`,
      );
    }
    bootstrap();
    ```

- **Checklist for New Backend Projects**
  - [ ] Install NestJS CLI and create new project
  - [ ] Configure global prefix with app name
  - [ ] Set up port configuration (4000, 4001, 4002...)
  - [ ] Install and configure Swagger
  - [ ] Set up CQRS module
  - [ ] Create domain-based modules following directory structure
  - [ ] Implement commands with impl/ and handlers/ folders
  - [ ] Implement queries with impl/ and handlers/ folders
  - [ ] Create DTOs extending from packages/dtos with Swagger decorators
  - [ ] Set up controllers with proper Swagger documentation
  - [ ] Configure module registration
  - [ ] Test API endpoints and Swagger documentation

- **Required Scripts**
  - All backend applications must include the following scripts in their `package.json` file.
  - **Example (`@package.json`)**
    ```json
    "scripts": {
      "dev": "nest start --watch",
      "build": "nest build",
      "start": "nest start",
      "start:debug": "nest start --debug --watch",
      "start:prod": "node dist/main",
      "test": "jest",
      "test:watch": "jest --watch",
      "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
      "test:e2e": "jest --config ./test/jest-e2e.json",
      "lint": "eslint \"{src,apps,libs,test}/**/*.ts\""
    }
    ```

- **Assistant Reminders**
  - When creating or modifying backend projects:
    1. Always verify the correct directory structure for CQRS
    2. Ensure all DTOs have proper Swagger decorators
    3. Check that modules follow domain-driven design principles
    4. Validate port configuration for new applications
    5. Confirm global prefix matches application name
