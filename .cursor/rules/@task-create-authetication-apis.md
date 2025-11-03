---
description: This Cursor rule provides a complete implementation guide for creating basic authentication APIs (register-user, login, change-password, get-profile) in a NestJS backend application with JWT authentication.
globs:
alwaysApply: false
---

# task: create authentication apis

This rule provides a comprehensive, step-by-step implementation guide for creating basic authentication APIs in a NestJS backend application. It demonstrates the practical application of the `@task-create-an-api.md` rule through four essential authentication endpoints: `register-user`, `login`, `change-password`, and `get-profile`.

## Overview

This rule implements a complete JWT-based authentication system with the following APIs:

- **POST /register-user** - User registration with username/password
- **POST /login** - User authentication and JWT token generation
- **POST /change-password** - Password change for authenticated users
- **GET /get-profile** - Retrieve authenticated user profile

## Input Parameters

This rule uses the following input parameters that can be customized for any application and module:

- **`<APP>`**: The name of the NestJS application (example: `backend`, `api`, `auth-service`)
- **`<MODULE>`**: The name of the module within the application (example: `auth`, `authentication`, `user-auth`)

**Example Usage:**

- For application `backend` with module `auth`: APIs will be available at `/auth/register-user`, `/auth/login`, etc.
- For application `api` with module `authentication`: APIs will be available at `/authentication/register-user`, `/authentication/login`, etc.
- For application `user-service` with module `user-auth`: APIs will be available at `/user-auth/register-user`, `/user-auth/login`, etc.

All file paths and class names in this implementation guide use `backend` as `<APP>` and `auth` as `<MODULE>` as practical examples, but these can be replaced with your specific application and module names.

## Prerequisites

Before implementing these authentication APIs, ensure the following dependencies are available:

- `@repo/backend-modules-postgres` - For user data persistence
- `@repo/backend-modules-jwt` - For JWT token management
- `@repo/back-share` - For password hashing utilities
- `@repo/http-errors` - For standardized error responses
- `@repo/dtos` - For shared data transfer objects
- `@repo/postgres` - For database entities

## Implementation Guide

Follow these subtasks to implement the complete authentication system:

**Note:** Throughout this implementation guide, replace `<APP>` with your application name (e.g., `backend`, `api`) and `<MODULE>` with your module name (e.g., `auth`, `authentication`) as needed for your specific project structure.

## Environment Variables

- All environment variables required for database connections, credentials, or configuration **must** be defined in the `.env` file located at the project root directory. If you need to access these environment variables from any subfolder (such as during migration scripts or local development), **copy and paste** the `.env` file into that subfolder to ensure environment variable resolution works as expected. This practice ensures consistency and prevents issues with missing or misconfigured environment variables during migration execution or development tasks.

1. **SUBTASK-1: Build All Packages and Applications Before Implementation**

- Before starting the implementation of any API endpoint, ensure that the entire monorepo builds successfully. This step confirms that all packages and applications are in a valid, compilable state and helps catch any pre-existing build errors.
- Run the following command from the root of the repository to build all packages and applications:
  ```
  pnpm run build
  ```
- If you are working in a subfolder or a different environment, ensure the `.env` file is present in the working directory to provide the necessary environment variables for the build process.
- Only proceed with API development after confirming that all builds have completed successfully and without errors.

2. **SUBTASK-2: Run All Database Migrations Before Implementation**

- Before starting the implementation of any API endpoint, ensure that all database migrations are up to date. This guarantees that the database schema reflects the latest changes and prevents inconsistencies between the codebase and the database.
- Use the migration scripts provided in the `packages/postgres` package to apply all pending migrations.
- The recommended command is:
  ```
  pnpm --filter @repo/postgres run migrate:run
  ```
- If you are working in a subfolder or a different environment, ensure the `.env` file is present in the working directory to provide the necessary environment variables for the migration process.
- Only proceed with API development after confirming that all migrations have been successfully applied.

3. **SUBTASK-3: Create Shared DTOs in packages/dtos**

Create all request and response DTOs in `packages/dtos/src/<APP>/<MODULE>/dtos/`:

**Example path structure:**

- For `<APP>=backend` and `<MODULE>=auth`: `packages/dtos/src/back/auth/dtos/`
- For `<APP>=api` and `<MODULE>=authentication`: `packages/dtos/src/api/authentication/dtos/`

#### 3.1 Register User DTOs

**File: `packages/dtos/src/back/auth/dtos/register-user.request.dto.ts`**

```typescript
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUserRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
```

**File: `packages/dtos/src/back/auth/dtos/register-user.response.dto.ts`**

```typescript
import { User } from '@repo/postgres';

export class RegisterUserResponseDto {
  user: User;
  jwtToken: string;
}
```

#### 3.2 Login DTOs

**File: `packages/dtos/src/back/auth/dtos/login.request.dto.ts`**

```typescript
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
```

**File: `packages/dtos/src/back/auth/dtos/login.response.dto.ts`**

```typescript
import { User } from '@repo/postgres';

export class LoginResponseDto {
  user: User;
  jwtToken: string;
}
```

#### 3.3 Change Password DTO

**File: `packages/dtos/src/back/auth/dtos/change-password.request.dto.ts`**

```typescript
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
```

#### 3.4 Get Profile DTO

**File: `packages/dtos/src/back/auth/dtos/get-profile.response.dto.ts`**

```typescript
import { User } from '@repo/postgres';

export class GetProfileResponseDto {
  user: User;
}
```

#### 3.5 Index File

**File: `packages/dtos/src/back/auth/dtos/index.ts`**

```typescript
export * from './change-password.request.dto';
export * from './get-profile.response.dto';
export * from './login.request.dto';
export * from './login.response.dto';
export * from './register-user.request.dto';
export * from './register-user.response.dto';
```

4. **SUBTASK-4: Create API DTOs with Swagger Decorators**

Create API-specific DTOs in `apps/<APP>/src/modules/<MODULE>/dtos/`:

**Example path structure:**

- For `<APP>=backend` and `<MODULE>=auth`: `apps/backend/src/modules/auth/dtos/`
- For `<APP>=api` and `<MODULE>=authentication`: `apps/api/src/modules/authentication/dtos/`

#### 4.1 Register User API DTOs

**File: `apps/backend/src/modules/auth/dtos/register-user.request.dto.ts`**

```typescript
import { RegisterUserRequestDto } from '@repo/dtos';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserRequestDtoAPI extends RegisterUserRequestDto {
  @ApiProperty({
    description: 'Username for the new account',
    example: 'johndoe123',
    minLength: 6,
  })
  declare username: string;

  @ApiProperty({
    description: 'Password for the new account',
    example: 'securePassword123',
    minLength: 6,
  })
  declare password: string;
}
```

**File: `apps/backend/src/modules/auth/dtos/register-user.response.dto.ts`**

```typescript
import { RegisterUserResponseDto } from '@repo/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@repo/postgres';

export class RegisterUserResponseDtoAPI extends RegisterUserResponseDto {
  @ApiProperty({
    description: 'Created user information',
    type: () => User,
  })
  declare user: User;

  @ApiProperty({
    description: 'JWT authentication token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  declare jwtToken: string;
}
```

#### 4.2 Login API DTOs

**File: `apps/backend/src/modules/auth/dtos/login.request.dto.ts`**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { LoginRequestDto } from '@repo/dtos';

export class LoginRequestDtoAPI extends LoginRequestDto {
  @ApiProperty({
    description: 'Username for authentication',
    example: 'johndoe123',
  })
  declare username: string;

  @ApiProperty({
    description: 'Password for authentication',
    example: 'securePassword123',
  })
  declare password: string;
}
```

**File: `apps/backend/src/modules/auth/dtos/login.response.dto.ts`**

```typescript
import { LoginResponseDto } from '@repo/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@repo/postgres';

export class LoginResponseDtoAPI extends LoginResponseDto {
  @ApiProperty({
    description: 'Authenticated user information',
    type: () => User,
  })
  declare user: User;

  @ApiProperty({
    description: 'JWT authentication token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  declare jwtToken: string;
}
```

#### 4.3 Change Password API DTO

**File: `apps/backend/src/modules/auth/dtos/change-password.request.dto.ts`**

```typescript
import { ChangePasswordRequestDto } from '@repo/dtos';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordRequestDtoAPI extends ChangePasswordRequestDto {
  @ApiProperty({
    description: 'Current password for verification',
    example: 'currentPassword123',
  })
  declare currentPassword: string;

  @ApiProperty({
    description: 'New password to set',
    example: 'newSecurePassword123',
  })
  declare newPassword: string;
}
```

#### 4.4 Get Profile API DTO

**File: `apps/backend/src/modules/auth/dtos/get-profile.response.dto.ts`**

```typescript
import { GetProfileResponseDto } from '@repo/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@repo/postgres';

export class GetProfileResponseDtoAPI extends GetProfileResponseDto {
  @ApiProperty({
    description: 'User profile information',
    type: () => User,
  })
  declare user: User;
}
```

#### 4.5 API DTOs Index File

**File: `apps/backend/src/modules/auth/dtos/index.ts`**

```typescript
export * from './change-password.request.dto';
export * from './get-profile.response.dto';
export * from './login.request.dto';
export * from './login.response.dto';
export * from './register-user.request.dto';
export * from './register-user.response.dto';
```

5. **SUBTASK-5: Create CQRS Commands**

Create command classes in `apps/<APP>/src/modules/<MODULE>/commands/impl/`:

**Example path structure:**

- For `<APP>=backend` and `<MODULE>=auth`: `apps/backend/src/modules/auth/commands/impl/`
- For `<APP>=api` and `<MODULE>=authentication`: `apps/api/src/modules/authentication/commands/impl/`

#### 5.1 Register User Command

**File: `apps/backend/src/modules/auth/commands/impl/register-user.command.ts`**

```typescript
import { RegisterUserRequestDtoAPI } from '../../dtos';

export class RegisterUserCommand {
  constructor(
    public readonly registerUserRequestDtoAPI: RegisterUserRequestDtoAPI,
  ) {}
}
```

#### 5.2 Login Command

**File: `apps/backend/src/modules/auth/commands/impl/login.command.ts`**

```typescript
import { LoginRequestDtoAPI } from '../../dtos';

export class LoginCommand {
  constructor(public readonly loginRequestDtoAPI: LoginRequestDtoAPI) {}
}
```

#### 5.3 Change Password Command

**File: `apps/backend/src/modules/auth/commands/impl/change-password.command.ts`**

```typescript
import { ChangePasswordRequestDtoAPI } from '../../dtos';

export class ChangePasswordCommand {
  constructor(
    public readonly userId: string,
    public readonly changePasswordRequestDtoAPI: ChangePasswordRequestDtoAPI,
  ) {}
}
```

#### 5.4 Commands Index File

**File: `apps/backend/src/modules/auth/commands/impl/index.ts`**

```typescript
export * from './change-password.command';
export * from './login.command';
export * from './register-user.command';
```

6. **SUBTASK-6: Create CQRS Query**

Create query class in `apps/<APP>/src/modules/<MODULE>/queries/impl/`:

**Example path structure:**

- For `<APP>=backend` and `<MODULE>=auth`: `apps/backend/src/modules/auth/queries/impl/`
- For `<APP>=api` and `<MODULE>=authentication`: `apps/api/src/modules/authentication/queries/impl/`

#### 6.1 Get Profile Query

**File: `apps/backend/src/modules/auth/queries/impl/get-profile.query.ts`**

```typescript
export class GetProfileQuery {
  constructor(public readonly userId: string) {}
}
```

#### 6.2 Queries Index File

**File: `apps/backend/src/modules/auth/queries/impl/index.ts`**

```typescript
export * from './get-profile.query';
```

7. **SUBTASK-7: Create Command Handlers**

Create command handlers in `apps/<APP>/src/modules/<MODULE>/commands/handler/`:

**Example path structure:**

- For `<APP>=backend` and `<MODULE>=auth`: `apps/backend/src/modules/auth/commands/handler/`
- For `<APP>=api` and `<MODULE>=authentication`: `apps/api/src/modules/authentication/commands/handler/`

#### 7.1 Register User Handler

**File: `apps/backend/src/modules/auth/commands/handler/register-user.handler.ts`**

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { generateHashPassword } from '@repo/back-share';
import { JwtService } from '@repo/backend-modules-jwt';
import { UserService } from '@repo/backend-modules-postgres';
import { RegisterUserResponseDto } from '@repo/dtos';
import { CustomError, USER_USERNAME_ALREADY_EXISTS } from '@repo/http-errors';
import { Transactional } from 'typeorm-transactional';
import { RegisterUserCommand } from '../impl';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Transactional()
  async execute(
    command: RegisterUserCommand,
  ): Promise<RegisterUserResponseDto> {
    const { registerUserRequestDtoAPI } = command;
    const { username, password } = registerUserRequestDtoAPI;

    let user = await this.userService.getUserByUsername(username);
    if (user) {
      throw new CustomError(USER_USERNAME_ALREADY_EXISTS);
    }

    user = await this.userService.createUser({
      username,
      password: await generateHashPassword(password),
    });

    const jwtToken = await this.jwtService.sign({
      userId: user.id,
      createdAt: new Date(),
    });

    return {
      user,
      jwtToken,
    };
  }
}
```

#### 7.2 Login Handler

**File: `apps/backend/src/modules/auth/commands/handler/login.handler.ts`**

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { verifyPassword } from '@repo/back-share';
import { JwtService } from '@repo/backend-modules-jwt';
import { UserService } from '@repo/backend-modules-postgres';
import { CustomError, INVALID_CREDENTIALS } from '@repo/http-errors';
import { Transactional } from 'typeorm-transactional';
import { LoginResponseDtoAPI } from '../../dtos';
import { LoginCommand } from '../impl';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Transactional()
  async execute(command: LoginCommand): Promise<LoginResponseDtoAPI> {
    const { loginRequestDtoAPI } = command;
    const { username, password } = loginRequestDtoAPI;

    let userWithPassword =
      await this.userService.getUserByUsernameWithPassword(username);
    if (!userWithPassword) {
      throw new CustomError(INVALID_CREDENTIALS);
    }

    const isPasswordValid = await verifyPassword(
      userWithPassword.password,
      password,
    );

    if (!isPasswordValid) {
      throw new CustomError(INVALID_CREDENTIALS);
    }

    const jwtToken = await this.jwtService.sign({
      userId: userWithPassword.id,
      createdAt: new Date(),
    });

    const user = await this.userService.getUserById(userWithPassword.id);

    return {
      user,
      jwtToken,
    };
  }
}
```

#### 7.3 Change Password Handler

**File: `apps/backend/src/modules/auth/commands/handler/change-password.handler.ts`**

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { generateHashPassword, verifyPassword } from '@repo/back-share';
import { JwtService } from '@repo/backend-modules-jwt';
import { UserService } from '@repo/backend-modules-postgres';
import {
  CustomError,
  INVALID_CREDENTIALS,
  USER_NOT_FOUND,
} from '@repo/http-errors';
import { Transactional } from 'typeorm-transactional';
import { ChangePasswordCommand } from '../impl';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler
  implements ICommandHandler<ChangePasswordCommand>
{
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Transactional()
  async execute(command: ChangePasswordCommand) {
    const { changePasswordRequestDtoAPI, userId } = command;

    const { currentPassword, newPassword } = changePasswordRequestDtoAPI;

    let user = await this.userService.getUserById(userId);
    if (!user) {
      throw new CustomError(USER_NOT_FOUND);
    }

    user = await this.userService.getUserByUsernameWithPassword(user.username);

    const isPasswordValid = await verifyPassword(
      user.password,
      currentPassword,
    );

    if (!isPasswordValid) {
      throw new CustomError(INVALID_CREDENTIALS);
    }

    const hashedNewPassword = await generateHashPassword(newPassword);

    await this.userService.updateUser({
      userId,
      password: hashedNewPassword,
    });
  }
}
```

#### 7.4 Command Handlers Index File

**File: `apps/backend/src/modules/auth/commands/handler/index.ts`**

```typescript
import { ChangePasswordHandler } from './change-password.handler';
import { LoginHandler } from './login.handler';
import { RegisterUserHandler } from './register-user.handler';

export * from './change-password.handler';
export * from './login.handler';
export * from './register-user.handler';

export const commandHandlers = [
  RegisterUserHandler,
  LoginHandler,
  ChangePasswordHandler,
];
```

8. **SUBTASK-8: Create Query Handler**

Create query handler in `apps/<APP>/src/modules/<MODULE>/queries/handler/`:

**Example path structure:**

- For `<APP>=backend` and `<MODULE>=auth`: `apps/backend/src/modules/auth/queries/handler/`
- For `<APP>=api` and `<MODULE>=authentication`: `apps/api/src/modules/authentication/queries/handler/`

#### 8.1 Get Profile Handler

**File: `apps/backend/src/modules/auth/queries/handler/get-profile.handler.ts`**

```typescript
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserService } from '@repo/backend-modules-postgres';
import { GetProfileResponseDto } from '@repo/dtos';
import { GetProfileQuery } from '../impl';

@QueryHandler(GetProfileQuery)
export class GetProfileHandler implements IQueryHandler<GetProfileQuery> {
  constructor(private readonly userService: UserService) {}

  async execute(query: GetProfileQuery): Promise<GetProfileResponseDto> {
    const { userId } = query;
    const user = await this.userService.getUserById(userId);
    return { user };
  }
}
```

#### 8.2 Query Handlers Index File

**File: `apps/backend/src/modules/auth/queries/handler/index.ts`**

```typescript
import { GetProfileHandler } from './get-profile.handler';

export * from './get-profile.handler';

export const queryHandlers = [GetProfileHandler];
```

9. **SUBTASK-9: Create Auth Controller**

Create the controller in `apps/<APP>/src/modules/<MODULE>/`:

**Example path structure:**

- For `<APP>=backend` and `<MODULE>=auth`: `apps/backend/src/modules/auth/`
- For `<APP>=api` and `<MODULE>=authentication`: `apps/api/src/modules/authentication/`

**File: `apps/backend/src/modules/auth/auth.controller.ts`**

```typescript
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserId } from '@repo/back-share';
import {
  INVALID_CREDENTIALS,
  USER_NOT_FOUND,
  USER_USERNAME_ALREADY_EXISTS,
} from '@repo/http-errors';
import {
  ChangePasswordCommand,
  LoginCommand,
  RegisterUserCommand,
} from './commands/impl';
import {
  ChangePasswordRequestDtoAPI,
  GetProfileResponseDtoAPI,
  LoginRequestDtoAPI,
  LoginResponseDtoAPI,
  RegisterUserRequestDtoAPI,
  RegisterUserResponseDtoAPI,
} from './dtos';
import { GetProfileQuery } from './queries/impl';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('register-user')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with username and password, returns user data and JWT token',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: RegisterUserResponseDtoAPI,
    description: 'User registered successfully',
  })
  @ApiResponse(USER_USERNAME_ALREADY_EXISTS)
  registerUser(
    @Body() body: RegisterUserRequestDtoAPI,
  ): Promise<RegisterUserResponseDtoAPI> {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticates user with username and password, returns user data and JWT token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: LoginResponseDtoAPI,
    description: 'User logged in successfully',
  })
  @ApiResponse(INVALID_CREDENTIALS)
  login(@Body() body: LoginRequestDtoAPI): Promise<LoginResponseDtoAPI> {
    return this.commandBus.execute(new LoginCommand(body));
  }

  @Get('get-profile')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieves the authenticated user profile information',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetProfileResponseDtoAPI,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse(USER_NOT_FOUND)
  getProfile(@UserId() userId: string): Promise<GetProfileResponseDtoAPI> {
    return this.queryBus.execute(new GetProfileQuery(userId));
  }

  @Post('change-password')
  @ApiOperation({
    summary: 'Change user password',
    description:
      'Changes the password for the authenticated user after verifying current password',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password changed successfully',
  })
  @ApiResponse(USER_NOT_FOUND)
  @ApiResponse(INVALID_CREDENTIALS)
  changePassword(
    @Body() body: ChangePasswordRequestDtoAPI,
    @UserId() userId: string,
  ) {
    return this.commandBus.execute(new ChangePasswordCommand(userId, body));
  }
}
```

10. **SUBTASK-10: Create Auth Module**

Create the module in `apps/<APP>/src/modules/<MODULE>/`:

**Example path structure:**

- For `<APP>=backend` and `<MODULE>=auth`: `apps/backend/src/modules/auth/`
- For `<APP>=api` and `<MODULE>=authentication`: `apps/api/src/modules/authentication/`

**File: `apps/backend/src/modules/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@repo/backend-modules-jwt';
import { PostgresModule } from '@repo/backend-modules-postgres';
import { AuthController } from './auth.controller';
import { commandHandlers } from './commands/handler';
import { queryHandlers } from './queries/handler';

@Module({
  imports: [CqrsModule, PostgresModule, JwtModule],
  controllers: [AuthController],
  providers: [...commandHandlers, ...queryHandlers],
})
export class AuthModule {}
```

11. **SUBTASK-11: Register Auth Module in App Module**

Add the `<MODULE>Module` to your main application module:

**Example module names:**

- For `<MODULE>=auth`: `AuthModule`
- For `<MODULE>=authentication`: `AuthenticationModule`
- For `<MODULE>=user-auth`: `UserAuthModule`

**File: `apps/backend/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
// ... other imports

@Module({
  imports: [
    AuthModule,
    // ... other modules
  ],
  // ... other configuration
})
export class AppModule {}
```

12. **SUBTASK-12: Build All Packages and Applications to Verify Integration**

- To ensure that all packages and applications in the monorepo build and integrate correctly, run the following command from the root of your repository: `npm run build`

- Verify the app builds and starts: `pnpm -w --filter <APP> dev` (or your workspace runner).
- Ensure the global prefix equals `<APP>` and that the application responds under `http://localhost:<PORT>/<APP>`.

## API Endpoints Summary

After implementation, the following endpoints will be available:

| Method | Endpoint                    | Description       | Authentication |
| ------ | --------------------------- | ----------------- | -------------- |
| POST   | `/<MODULE>/register-user`   | Register new user | No             |
| POST   | `/<MODULE>/login`           | User login        | No             |
| GET    | `/<MODULE>/get-profile`     | Get user profile  | JWT Required   |
| POST   | `/<MODULE>/change-password` | Change password   | JWT Required   |

**Example endpoints for different module names:**

- For `<MODULE>=auth`: `/auth/register-user`, `/auth/login`, etc.
- For `<MODULE>=authentication`: `/authentication/register-user`, `/authentication/login`, etc.
- For `<MODULE>=user-auth`: `/user-auth/register-user`, `/user-auth/login`, etc.

## Security Features

- **Password Hashing**: Uses bcrypt for secure password storage
- **JWT Authentication**: Stateless token-based authentication
- **Input Validation**: Comprehensive validation using class-validator
- **Error Handling**: Standardized error responses
- **Transaction Support**: Database operations wrapped in transactions

## Testing the APIs

Use the Swagger documentation at `/<APP>/docs` to test the implemented endpoints:

**Example Swagger URLs:**

- For `<APP>=backend`: `/backend/docs`
- For `<APP>=api`: `/api/docs`
- For `<APP>=auth-service`: `/auth-service/docs`

1. **Register User**: Create a new account
2. **Login**: Authenticate and receive JWT token
3. **Get Profile**: Use JWT token to retrieve user profile
4. **Change Password**: Use JWT token to change password

## Notes

- All password operations use secure hashing with `@repo/back-share`
- JWT tokens are generated with user ID and creation timestamp
- Authentication guards protect sensitive endpoints
- Transactional decorators ensure data consistency
- Comprehensive error handling with custom error types
