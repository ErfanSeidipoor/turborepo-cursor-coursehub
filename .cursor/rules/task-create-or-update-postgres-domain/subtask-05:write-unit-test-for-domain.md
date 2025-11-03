# SUBTASK-5: Write Unit Tests for Domain Services

## Overview

Unit tests for each DomainService in `packages/backend-modules/postgres/src/services/` must comprehensively verify that:

1. Each service method works as expected
2. All domain rules defined in `packages/docs/domains.md` are enforced

## Testing Philosophy: Integration Testing with Real Database

### Important: No Mocking of Database Layer

**This testing approach does NOT use mocks for PostgreSQL or TypeORM methods.**

Instead, we use a **real PostgreSQL database** for testing with the following characteristics:

- **Real Database Connection**: Tests connect to an actual PostgreSQL instance (test database)
- **Real TypeORM Operations**: All repository methods, queries, and database operations are executed against the real database
- **Real Data Persistence**: Data is actually written to and read from the database
- **Real Constraints**: Database constraints (unique, foreign keys, etc.) are enforced by PostgreSQL
- **Real Transactions**: TypeORM transactions work as they would in production

### Why This Approach?

1. **High Confidence**: Tests verify actual database behavior, not mocked behavior
2. **Constraint Testing**: Database-level constraints (unique indexes, foreign keys) are properly tested
3. **Query Correctness**: Complex queries, joins, and relations are tested with real data
4. **Migration Validation**: Tests run against actual migrations, validating schema correctness
5. **ORM Behavior**: TypeORM entity behavior, hooks, and transformations work as in production

### Test Database Isolation

Each test run uses an isolated database environment:

- Database name is suffixed with `-test` (e.g., `myapp-test`)
- Database is dropped and recreated before each test to ensure isolation
- Migrations are run fresh for each test

## Test Manager: The Testing Infrastructure

All tests use the `TestManager` utility class located at:

```
packages/backend-modules/postgres/src/test-manager.test.ts
```

### TestManager Responsibilities

The `TestManager` provides:

1. **NestJS Testing Module Setup**: Creates and manages the NestJS testing module
2. **Database Connection Management**: Handles PostgreSQL DataSource initialization
3. **Database State Management**: Drops and recreates database between tests
4. **Service Injection**: Provides access to service instances
5. **Repository Access**: Provides direct repository access for data verification
6. **Transaction Context**: Initializes typeorm-transactional context

### TestManager Structure

```typescript
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables and suffix database name with -test
dotenv.config({
  path: path.resolve(__dirname, '../../../../.env'),
  override: true,
});
if (process.env['POSTGRES__DB_DATABASE']) {
  process.env['POSTGRES__DB_DATABASE'] =
    process.env['POSTGRES__DB_DATABASE'] + '-test';
}

import { Test, TestingModule } from '@nestjs/testing';
import { PostgresModule } from './module';
import { DataSource, Repository } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { getRepositoryToken } from '@nestjs/typeorm';

export class TestManager {
  public static module: TestingModule;
  public static dataSource: DataSource;

  // Initialize NestJS module and database connection
  static async beforeAll(): Promise<TestingModule> {
    initializeTransactionalContext();

    if (!TestManager.module) {
      TestManager.module = await Test.createTestingModule({
        imports: [PostgresModule],
        providers: [],
      }).compile();
    }

    if (!TestManager.dataSource) {
      TestManager.dataSource = TestManager.module.get<DataSource>(DataSource);
    }

    return TestManager.module;
  }

  // Run database migrations
  static async runMigration(): Promise<void> {
    await this.dataSource.runMigrations();
  }

  // Drop entire database
  static async dropDatabase(): Promise<void> {
    await this.dataSource.dropDatabase();
  }

  // Clean slate before each test
  static async beforeEach(): Promise<void> {
    await this.dropDatabase();
    await this.runMigration();
    jest.clearAllMocks();
  }

  // Get service instance from DI container
  static getHandler<T>(type: new (...args: any[]) => T): T {
    return TestManager.module.get<T>(type);
  }

  // Get repository instance for direct database access
  static getRepository<T>(entity: new (...args: any[]) => T): Repository<T> {
    return TestManager.module.get<Repository<T>>(getRepositoryToken(entity));
  }

  // Cleanup connections
  static async afterAll(): Promise<void> {
    if (TestManager.dataSource) {
      await TestManager.dataSource.destroy();
    }
    if (TestManager.module) {
      await TestManager.module.close();
    }
  }
}
```

### TestManager Methods

#### `beforeAll()`

- **Purpose**: One-time setup before all tests in a suite
- **Actions**:
  - Initializes typeorm-transactional context
  - Creates NestJS testing module with PostgresModule
  - Establishes DataSource connection to test database
- **Usage**: Called once per test file
- **Database State**: Connection established, ready for migrations

#### `afterAll()`

- **Purpose**: Cleanup after all tests complete
- **Actions**:
  - Destroys DataSource connection
  - Closes NestJS testing module
- **Usage**: Called once per test file after all tests
- **Database State**: All connections closed, resources freed

#### `beforeEach()`

- **Purpose**: Reset database state before each individual test
- **Actions**:
  - Drops entire test database (removes all tables and data)
  - Runs all migrations from scratch
  - Clears all Jest mocks
- **Usage**: Called before every single test case
- **Database State**: Fresh database with clean schema, no data

#### `getHandler<T>(ServiceClass)`

- **Purpose**: Get service instance from NestJS DI container
- **Returns**: Fully initialized service with all dependencies injected
- **Usage**: Get the service you want to test
- **Example**: `const userService = TestManager.getHandler(UserService);`

#### `getRepository<T>(EntityClass)`

- **Purpose**: Get TypeORM repository for direct database access
- **Returns**: Repository instance for the entity
- **Usage**: Verify data directly in database, bypass service layer
- **Example**: `const userRepo = TestManager.getRepository(User);`

### Test Lifecycle Example

```typescript
describe('UserService - createUser', () => {
  // 1. ONCE: Setup module and database connection
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  // 2. ONCE: Cleanup connections after all tests
  afterAll(async () => {
    await TestManager.afterAll();
  });

  // 3. BEFORE EACH TEST: Drop DB, run migrations, clear mocks
  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  // 4. TEST: Each test starts with a clean database
  it('should create a new user with valid input', async () => {
    const userService = TestManager.getHandler(UserService);
    // Database is empty at this point
    const user = await userService.createUser({
      username: 'testuser',
      password: 'password123',
    });
    // User is now in the real database
    expect(user.id).toBeDefined();
  });

  // 5. BEFORE NEXT TEST: Database is dropped and recreated again
  it('should throw error for duplicate username', async () => {
    const userService = TestManager.getHandler(UserService);
    // Database is empty again (previous user is gone)
    await userService.createUser({
      username: 'testuser',
      password: 'password123',
    });
    // This test creates its own data
    await expect(
      userService.createUser({
        username: 'testuser',
        password: 'different',
      }),
    ).rejects.toThrow();
  });
});
```

### Key Testing Principles with TestManager

1. **Database Isolation**: Each test starts with a completely empty database
2. **No Data Pollution**: Tests cannot interfere with each other
3. **Real Database Operations**: All CRUD operations actually happen in PostgreSQL
4. **Migration Validation**: Every test validates that migrations work correctly
5. **Independent Tests**: Tests can run in any order without side effects
6. **No Mocking**: Database layer, TypeORM, and repositories are real

### Environment Configuration

The TestManager automatically:

1. Loads environment variables from project root `.env` file
2. Appends `-test` suffix to database name
3. Example: `myapp` database becomes `myapp-test` for tests

This ensures tests never interfere with development or production databases.

## Running Tests

The `packages/backend-modules/postgres/package.json` provides three npm commands for running tests:

### 1. Test a Single File: `test:file`

Run a specific test file:

```bash
pnpm --filter @repo/backend-modules-postgres test:file --name=src/services/user.test/methods/create-user.test.ts
```

**Use Case:**

- Testing a single test file you just created or modified
- Quick feedback during development
- Debugging a specific test

**Command Format:**

```bash
pnpm --filter @repo/backend-modules-postgres test:file --name=<path-to-test-file>
```

**Examples:**

```bash
# Test a specific method test
pnpm --filter @repo/backend-modules-postgres test:file --name=src/services/user.test/methods/create-user.test.ts

# Test a specific rule test
pnpm --filter @repo/backend-modules-postgres test:file --name=src/services/user.test/rules/rule-01-username-unique.test.ts
```

### 2. Test Entire Domain: `test:domain`

Run all tests for a specific domain service:

```bash
pnpm --filter @repo/backend-modules-postgres test:domain --name=user
```

**Use Case:**

- Testing all methods and rules for a domain after changes
- Verifying domain-wide functionality
- Ensuring domain rules are enforced across all methods

**Command Format:**

```bash
pnpm --filter @repo/backend-modules-postgres test:domain --name=<domain-name>
```

**What It Runs:**

- All test files in `src/services/<domain-name>.test/methods/`
- All test files in `src/services/<domain-name>.test/rules/`

**Examples:**

```bash
# Test all User domain tests
pnpm --filter @repo/backend-modules-postgres test:domain --name=user

# Test all Product domain tests (when created)
pnpm --filter @repo/backend-modules-postgres test:domain --name=product
```

### 3. Test All Services: `test:all`

Run all tests for all domain services in the module:

```bash
pnpm --filter @repo/backend-modules-postgres test:all
```

**Use Case:**

- Final validation before committing
- Ensuring no regressions across domains
- Pre-deployment testing
- CI/CD pipeline integration

**What It Runs:**

- All test files in `src/services/*/` directories
- Every domain's methods and rules tests
- Complete test suite for the postgres backend module

### Test Execution Options

All commands support Jest options:

```bash
# Run with coverage
pnpm --filter @repo/backend-modules-postgres test:domain --name=user -- --coverage

# Run in watch mode (useful during development)
pnpm --filter @repo/backend-modules-postgres test:file --name=src/services/user.test/methods/create-user.test.ts -- --watch

# Run with verbose output
pnpm --filter @repo/backend-modules-postgres test:domain --name=user -- --verbose
```

### Testing Workflow: Order of Test Execution

When completing a testing task (creating or updating tests for a domain), follow this sequence:

#### Step 1: Test Individual Files (During Development)

As you create or modify each test file, run it individually:

```bash
# Just created/modified create-user.test.ts
pnpm --filter @repo/backend-modules-postgres test:file --name=src/services/user.test/methods/create-user.test.ts

# Just created/modified rule-01-username-unique.test.ts
pnpm --filter @repo/backend-modules-postgres test:file --name=src/services/user.test/rules/rule-01-username-unique.test.ts
```

**Purpose:** Quick feedback loop, catch issues immediately

#### Step 2: Test the Entire Domain

After completing all test files for the domain:

```bash
pnpm --filter @repo/backend-modules-postgres test:domain --name=user
```

**Purpose:**

- Verify all domain tests pass together
- Ensure no conflicts between test files
- Validate complete domain coverage

#### Step 3: Test All Services (Final Validation)

Before marking the task as complete:

```bash
pnpm --filter @repo/backend-modules-postgres test:all
```

**Purpose:**

- Ensure no regressions in other domains
- Validate entire module integrity
- Confirm readiness for commit/merge

### Complete Testing Workflow Example

```bash
# 1. Create first test file
# ... write src/services/user.test/methods/create-user.test.ts ...
pnpm --filter @repo/backend-modules-postgres test:file --name=src/services/user.test/methods/create-user.test.ts
# ✅ Passes

# 2. Create second test file
# ... write src/services/user.test/methods/find-user-by-id.test.ts ...
pnpm --filter @repo/backend-modules-postgres test:file --name=src/services/user.test/methods/find-user-by-id.test.ts
# ✅ Passes

# 3. Continue with remaining test files...

# 4. Create rule test files
# ... write src/services/user.test/rules/rule-01-username-unique.test.ts ...
pnpm --filter @repo/backend-modules-postgres test:file --name=src/services/user.test/rules/rule-01-username-unique.test.ts
# ✅ Passes

# 5. After all User domain tests are created, test entire domain
pnpm --filter @repo/backend-modules-postgres test:domain --name=user
# ✅ All User tests pass

# 6. Final validation - test all services
pnpm --filter @repo/backend-modules-postgres test:all
# ✅ All services tests pass

# 7. Task complete - ready to commit
```

### Troubleshooting Failed Tests

If tests fail:

1. **Single file fails**: Fix the specific test file

   ```bash
   pnpm --filter @repo/backend-modules-postgres test:file --name=<failing-file> -- --verbose
   ```

2. **Domain tests fail**: Identify which file(s) failed

   ```bash
   pnpm --filter @repo/backend-modules-postgres test:domain --name=<domain> -- --verbose
   ```

3. **All tests fail**: Usually indicates a breaking change
   ```bash
   pnpm --filter @repo/backend-modules-postgres test:all -- --verbose
   ```

### Important Notes

- **`--runInBand` flag**: All commands run with `--runInBand` to ensure tests execute sequentially (one at a time), preventing database conflicts
- **Database reset**: Each test gets a fresh database thanks to `TestManager.beforeEach()`
- **Test isolation**: Tests are independent and can run in any order
- **CI/CD**: Use `test:all` in continuous integration pipelines

## Test Directory Structure

For each `{Domain}Service`, create a test directory structure as follows:

```
packages/backend-modules/postgres/src/services/
├── {domain}.service.ts
└── {domain}.test/
    ├── methods/
    │   ├── create-{entity}.test.ts
    │   ├── update-{entity}.test.ts
    │   ├── delete-{entity}.test.ts
    │   ├── find-{entity}-by-id.test.ts
    │   ├── find-{entity}-by-{field}.test.ts
    │   └── find-{entities}.test.ts
    └── rules/
        ├── rule-01-{description}.test.ts
        ├── rule-02-{description}.test.ts
        └── ...
```

### Example:

For `UserService`:

- Service file: `packages/backend-modules/postgres/src/services/user.service.ts`
- Test directory: `packages/backend-modules/postgres/src/services/user.test/`
- Method tests: `packages/backend-modules/postgres/src/services/user.test/methods/create-user.test.ts`
- Rule tests: `packages/backend-modules/postgres/src/services/user.test/rules/rule-01-username-unique.test.ts`

## 1. Method Tests (`methods/` directory)

### Purpose

Test each service method individually to verify correct behavior, error handling, and edge cases.

### File Naming Convention

- One file per method
- Use kebab-case: `{method-name}.test.ts`
- Examples:
  - `create-user.test.ts`
  - `find-user-by-id.test.ts`
  - `find-users.test.ts`
  - `update-user.test.ts`
  - `delete-user.test.ts`

### Test File Structure

```typescript
import { CustomError, DOMAIN_ERROR_CONSTANTS } from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { DomainService } from '../../domain.service';
import { faker } from '@faker-js/faker';
// Import other dependencies as needed

describe('DomainService - methodName', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  // Test cases here
});
```

### Test Coverage Requirements for Methods

Each method test file must include test cases for:

#### 1. **Happy Path** (Successful Operations)

```typescript
it('should {perform expected action} when {valid conditions}', async () => {
  const domainService = TestManager.getHandler(DomainService);
  // Arrange: Setup test data
  const inputData = {
    field: faker.appropriate.method(),
  };

  // Act: Execute the method
  const actualResult = await domainService.methodName(inputData);

  // Assert: Verify expected behavior
  expect(actualResult.field).toBe(inputData.field);
  expect(actualResult.id).toBeDefined();
});
```

#### 2. **Error Cases** (Validation Failures)

```typescript
it('should throw ERROR_CONSTANT when {invalid condition}', async () => {
  const domainService = TestManager.getHandler(DomainService);

  await expect(
    domainService.methodName({
      field: invalidValue,
    }),
  ).rejects.toThrow(new CustomError(ERROR_CONSTANT));
});
```

#### 3. **Edge Cases**

- Empty strings
- Whitespace-only values
- Null/undefined values
- Maximum/minimum length boundaries
- Special characters/Unicode
- Case sensitivity

Example:

```typescript
it('should throw ERROR_EMPTY when field contains only whitespace', async () => {
  const domainService = TestManager.getHandler(DomainService);

  await expect(
    domainService.methodName({
      field: '   ',
    }),
  ).rejects.toThrow(new CustomError(ERROR_EMPTY));
});
```

#### 4. **Business Logic Specific to Method**

For **Create** methods:

- Valid creation with all required fields
- Unique constraint violations
- Required field validations
- Default value assignments
- Data transformations (trim, lowercase, etc.)

For **Find/Query** methods:

- Found with valid input
- Not found scenarios (with/without returnError flag)
- Search functionality
- Pagination (page, limit, totalItems, etc.)
- Sorting (ASC/DESC)
- Filtering
- Relations/associations loading

For **Update** methods:

- Update single field
- Update multiple fields
- Not found scenarios
- Validation on updated values
- Preventing invalid updates
- Data transformations

For **Delete** methods:

- Successful deletion
- Not found scenarios
- Soft delete verification
- Cascade/referential integrity

### Test Naming Convention for Methods

- Start with lowercase "should"
- Be descriptive about what is being tested
- Include the condition being tested
- Examples:
  - `should create a new user with valid input`
  - `should throw USER_NOT_FOUND when user does not exist`
  - `should filter users by search term`
  - `should trim username before saving`

## 2. Rule Tests (`rules/` directory)

### Purpose

Test each domain rule defined in `packages/docs/domains.md` to ensure comprehensive enforcement across all relevant service methods.

### File Naming Convention

- One file per domain rule
- Format: `rule-{number}-{short-description}.test.ts`
- Number corresponds to rule number in `packages/docs/domains.md`
- Use kebab-case for description
- Examples:
  - `rule-01-username-unique.test.ts`
  - `rule-02-password-hashed.test.ts`
  - `rule-03-password-excluded-default.test.ts`

### Test File Structure

```typescript
import { CustomError, ERROR_CONSTANTS } from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { DomainService } from '../../domain.service';
import { Entity } from '@repo/postgres/entities/entity.entity';
import { faker } from '@faker-js/faker';
// Import other dependencies (helpers, spies, etc.)

/**
 * DOMAIN RULE {number}: {Full description from packages/docs/domains.md}
 *
 * This test suite verifies that {detailed explanation of what is being tested}.
 */
describe('Domain Rule {number} - {Title}', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  // Test cases here
});
```

### Test Coverage Requirements for Rules

Each rule test file must include:

#### 1. **Multiple Test Cases per Rule**

- Number tests sequentially: `{ruleNumber}.{testNumber}`
- Cover all scenarios where the rule applies
- Test across different methods that might affect the rule

Example:

```typescript
it('01.1 - should prevent creating a new user with an existing username', async () => {
  // Test implementation
});

it('01.2 - should prevent updating a user to a username that already exists', async () => {
  // Test implementation
});

it('01.3 - should allow creating a user with a unique username', async () => {
  // Test implementation
});
```

#### 2. **Positive and Negative Test Cases**

- Test that rule is enforced (negative cases)
- Test that valid operations are allowed (positive cases)
- Test boundary conditions

#### 3. **Cross-Method Verification**

Test the rule across all relevant service methods:

- Create operations
- Update operations
- Query operations
- Delete operations

#### 4. **Integration with Domain Logic**

- Use real repositories when testing database constraints
- Use spies when testing helper function usage
- Verify data transformations

### Common Rule Testing Patterns

#### Pattern 1: Uniqueness Constraints

```typescript
it('{ruleNumber}.1 - should prevent creating with duplicate value', async () => {
  const service = TestManager.getHandler(DomainService);
  const value = faker.appropriate.method();

  await service.createMethod({ field: value });

  await expect(service.createMethod({ field: value })).rejects.toThrow(
    new CustomError(DUPLICATE_ERROR),
  );
});

it('{ruleNumber}.2 - should prevent updating to duplicate value', async () => {
  const service = TestManager.getHandler(DomainService);

  const entity1 = await service.createMethod({ field: 'value1' });
  const entity2 = await service.createMethod({ field: 'value2' });

  await expect(
    service.updateMethod({
      id: entity2.id,
      field: entity1.field,
    }),
  ).rejects.toThrow(new CustomError(DUPLICATE_ERROR));
});
```

#### Pattern 2: Data Transformation Rules

```typescript
it('{ruleNumber}.1 - should hash password when creating', async () => {
  const service = TestManager.getHandler(DomainService);
  const plainPassword = faker.internet.password();

  const generateHashPasswordSpy = jest.spyOn(
    passwordHelper,
    'generateHashPassword',
  );

  await service.createUser({
    username: faker.internet.username(),
    password: plainPassword,
  });

  expect(generateHashPasswordSpy).toHaveBeenCalledWith(plainPassword);
  generateHashPasswordSpy.mockRestore();
});

it('{ruleNumber}.2 - should never store plain text in database', async () => {
  const service = TestManager.getHandler(DomainService);
  const repository = TestManager.getRepository(Entity);

  const plainPassword = 'MySecretPassword123!';
  const entity = await service.createMethod({ password: plainPassword });

  const entityFromDb = await repository.findOne({
    where: { id: entity.id },
    select: ['id', 'password'],
  });

  expect(entityFromDb?.password).not.toBe(plainPassword);
  expect(entityFromDb?.password).toBeDefined();
});
```

#### Pattern 3: Field Exclusion Rules

```typescript
it('{ruleNumber}.1 - should not include field by default', async () => {
  const service = TestManager.getHandler(DomainService);

  const entity = await service.createMethod({ field: 'value' });
  const actualResult = await service.findMethod({ id: entity.id });

  expect(actualResult).toBeDefined();
  expect(actualResult?.sensitiveField).toBeUndefined();
});

it('{ruleNumber}.2 - should explicitly include field when requested', async () => {
  const service = TestManager.getHandler(DomainService);

  const entity = await service.createMethod({ field: 'value' });
  const actualResult = await service.findMethod({
    id: entity.id,
    includeField: true,
  });

  expect(actualResult).toBeDefined();
  expect(actualResult?.sensitiveField).toBeDefined();
});
```

#### Pattern 4: Required Field Rules

```typescript
it('{ruleNumber}.1 - should reject when required field is missing', async () => {
  const service = TestManager.getHandler(DomainService);

  await expect(service.createMethod({ requiredField: '' })).rejects.toThrow(
    new CustomError(FIELD_REQUIRED),
  );
});

it('{ruleNumber}.2 - should reject field with only whitespace', async () => {
  const service = TestManager.getHandler(DomainService);

  await expect(service.createMethod({ requiredField: '   ' })).rejects.toThrow(
    new CustomError(FIELD_EMPTY),
  );
});
```

#### Pattern 5: Auto-Generated Field Rules

```typescript
it('{ruleNumber}.1 - should receive auto-generated value after creation', async () => {
  const service = TestManager.getHandler(DomainService);

  const actualResult = await service.createMethod({ field: 'value' });

  expect(actualResult.id).toBeDefined();
  expect(typeof actualResult.id).toBe('string');
  // Verify UUID format if applicable
  expect(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      actualResult.id,
    ),
  ).toBe(true);
});

it('{ruleNumber}.2 - should ensure each entity receives a unique value', async () => {
  const service = TestManager.getHandler(DomainService);

  const result1 = await service.createMethod({ field: 'value1' });
  const result2 = await service.createMethod({ field: 'value2' });

  expect(result1.id).not.toBe(result2.id);
});
```

#### Pattern 6: Timestamp Rules

```typescript
it('{ruleNumber}.1 - should receive auto-generated timestamps after creation', async () => {
  const service = TestManager.getHandler(DomainService);

  const actualResult = await service.createMethod({ field: 'value' });

  expect(actualResult.createdAt).toBeDefined();
  expect(actualResult.updatedAt).toBeDefined();
  expect(actualResult.createdAt).toBeInstanceOf(Date);
  expect(actualResult.updatedAt).toBeInstanceOf(Date);
});

it('{ruleNumber}.2 - should ensure createdAt remains unchanged after updates', async () => {
  const service = TestManager.getHandler(DomainService);

  const entity = await service.createMethod({ field: 'value' });
  const originalCreatedAt = entity.createdAt;

  await new Promise((resolve) => setTimeout(resolve, 10));

  const actualResult = await service.updateMethod({
    id: entity.id,
    field: 'newValue',
  });

  expect(actualResult.createdAt).toEqual(originalCreatedAt);
});
```

## 3. Common Testing Patterns

### TestManager Utility Usage

> **Note**: For complete details about TestManager, including its implementation, methods, and lifecycle, see the [Test Manager: The Testing Infrastructure](#test-manager-the-testing-infrastructure) section above.

The `TestManager` class provides test infrastructure and is used in every test file:

```typescript
// Get service instance
const service = TestManager.getHandler(DomainService);

// Get repository instance (for direct database access)
const repository = TestManager.getRepository(Entity);

// Setup hooks (REQUIRED in every test file)
beforeAll(async () => {
  await TestManager.beforeAll(); // Initialize module and database
});

afterAll(async () => {
  await TestManager.afterAll(); // Cleanup connections
});

beforeEach(async () => {
  await TestManager.beforeEach(); // Drop database, run migrations, clear mocks
});
```

**Key Points:**

- **No mocking**: TestManager uses a real PostgreSQL database
- **Fresh state**: Each test gets a clean database via `beforeEach()`
- **Real operations**: All database operations execute against actual PostgreSQL
- **Database suffix**: Test database is automatically named with `-test` suffix

### Data Generation with Faker

Use faker for realistic test data:

```typescript
import { faker } from '@faker-js/faker';

// Common patterns:
const username = faker.internet.username();
const password = faker.internet.password();
const email = faker.internet.email();
const uuid = faker.string.uuid();
const name = faker.person.fullName();
const date = faker.date.past();
```

### Variable Naming Conventions

Follow these naming conventions for test variables:

```typescript
// Input data
const inputData = { ... };
const mockData = { ... };

// Actual results from methods
const actualResult = await service.method();

// Expected values
const expectedValue = 'something';
const expectedCount = 5;

// Entities
const user = await service.createUser();
const existingUser = await service.findUser();
```

### Assertion Patterns

```typescript
// Exact equality
expect(actualResult.field).toBe(expectedValue);

// Object equality
expect(actualResult).toEqual(expectedObject);

// Defined/Undefined
expect(actualResult).toBeDefined();
expect(actualResult.field).toBeUndefined();

// Null checks
expect(actualResult).toBeNull();
expect(actualResult).not.toBeNull();

// Type checks
expect(typeof actualResult.id).toBe('string');
expect(actualResult.date).toBeInstanceOf(Date);

// Array/Collection checks
expect(actualResult.items.length).toBe(5);
expect(actualResult.items).toContain(item);

// Numeric comparisons
expect(actualResult.count).toBeGreaterThan(0);
expect(actualResult.value).toBeLessThanOrEqual(100);

// Error assertions
await expect(service.method(invalidInput)).rejects.toThrow(
  new CustomError(ERROR_CONSTANT),
);

// Spy/Mock assertions
expect(spyFunction).toHaveBeenCalledWith(expectedArg);
expect(spyFunction).toHaveBeenCalledTimes(1);
```

### Testing Pagination

```typescript
it('should paginate results with custom page and limit', async () => {
  const service = TestManager.getHandler(DomainService);

  // Arrange: Create test data
  for (let i = 0; i < 10; i++) {
    await service.createMethod({ field: `value${i}` });
  }

  // Act: Query with pagination
  const actualResult = await service.findMethods({
    page: 2,
    limit: 5,
  });

  // Assert: Verify pagination metadata
  expect(actualResult.items.length).toBe(5);
  expect(actualResult.meta?.currentPage).toBe(2);
  expect(actualResult.meta?.itemsPerPage).toBe(5);
  expect(actualResult.meta?.totalItems).toBe(10);
});
```

### Testing Sorting

```typescript
it('should sort entities by field and sort type', async () => {
  const service = TestManager.getHandler(DomainService);

  await service.createMethod({ name: 'Bob' });
  await service.createMethod({ name: 'Alice' });

  const actualResult = await service.findMethods({
    sort: 'name',
    sortType: SortEnum.ASC,
  });

  expect(actualResult.items[0]?.name).toBe('Alice');
  expect(actualResult.items[1]?.name).toBe('Bob');
});
```

### Testing Search/Filtering

```typescript
it('should filter entities by search term', async () => {
  const service = TestManager.getHandler(DomainService);

  await service.createMethod({ name: 'testuser123' });
  await service.createMethod({ name: 'anotheruser' });

  const actualResult = await service.findMethods({
    searchTerm: 'test',
  });

  expect(actualResult.items.length).toBe(1);
  expect(actualResult.items[0]?.name).toBe('testuser123');
});
```

### Testing with Spies

```typescript
import * as helperModule from '@repo/back-share/helpers/helper';

it('should call helper function with correct arguments', async () => {
  const service = TestManager.getHandler(DomainService);

  const helperSpy = jest.spyOn(helperModule, 'helperFunction');

  await service.method({ field: 'value' });

  expect(helperSpy).toHaveBeenCalledWith('value');

  helperSpy.mockRestore();
});
```

## 4. Import Patterns

### Required Imports

```typescript
// Testing infrastructure
import { TestManager } from '../../../test-manager.test';

// Service under test
import { DomainService } from '../../domain.service';

// Entities (when needed for direct repository access)
import { Entity } from '@repo/postgres/entities/entity.entity';

// Error handling
import { CustomError, ERROR_CONSTANTS } from '@repo/http-errors';

// Enums (when needed)
import { SortEnum } from '@repo/enums';

// Test data generation
import { faker } from '@faker-js/faker';

// Helper modules (when testing their usage)
import * as helperModule from '@repo/back-share/helpers/helper';
```

## 5. Best Practices

### General Testing Principles

1. **Follow Arrange-Act-Assert (AAA) Pattern**
   - Arrange: Set up test data and preconditions
   - Act: Execute the method being tested
   - Assert: Verify expected outcomes

2. **One Assertion Focus per Test**
   - Each test should verify one specific behavior
   - Multiple assertions are okay if they verify the same behavior

3. **Descriptive Test Names**
   - Use "should" statements
   - Be specific about what is being tested
   - Include the condition being tested

4. **Independent Tests**
   - Tests should not depend on each other
   - Each test should work in isolation
   - Use `beforeEach` to reset state

5. **Clear Variable Naming**
   - Follow naming conventions (actualResult, expectedX, inputX, mockX)
   - Use descriptive names that indicate purpose

6. **Test Real Behavior**
   - Test through the service interface (not internal implementation)
   - **DO NOT mock** PostgreSQL, TypeORM, or repository methods
   - Use real database for all database operations
   - Use spies ONLY for helper functions (like password hashing)
   - Verify data by querying the actual database when needed

7. **Keep Tests Focused**
   - Test one method at a time in method tests
   - Test one rule at a time in rule tests
   - Don't test implementation details

8. **Complete Coverage**
   - Test happy paths
   - Test all error conditions
   - Test edge cases
   - Test boundary conditions

### Code Quality

1. **No Magic Values**
   - Use faker for random data
   - Use constants for error codes
   - Use variables for repeated values

2. **Avoid Test Duplication**
   - Extract common setup to helper functions if needed
   - Use beforeEach for common arrangements

3. **Clean Up After Tests**
   - Restore spies with `mockRestore()`
   - Use `afterAll` for cleanup

4. **Type Safety**
   - Use TypeScript properly
   - Don't use `any` type
   - Properly type test variables

## 6. Checklist for Complete Test Coverage

### For Each Service Method:

- [ ] Test file created in `methods/` directory
- [ ] File named correctly: `{method-name}.test.ts`
- [ ] All required imports included
- [ ] TestManager hooks configured
- [ ] Happy path test case(s)
- [ ] Error case test(s) for each possible error
- [ ] Edge case test(s) (empty, whitespace, boundaries)
- [ ] Business logic specific tests
- [ ] All assertions use proper expect() syntax
- [ ] Variables follow naming conventions
- [ ] Test descriptions are clear and descriptive

### For Each Domain Rule:

- [ ] Test file created in `rules/` directory
- [ ] File named correctly: `rule-{number}-{description}.test.ts`
- [ ] JSDoc comment with full rule description
- [ ] All required imports included
- [ ] TestManager hooks configured
- [ ] Multiple test cases covering all rule aspects
- [ ] Tests numbered sequentially ({ruleNumber}.{testNumber})
- [ ] Positive test cases (rule allows valid operations)
- [ ] Negative test cases (rule prevents invalid operations)
- [ ] Rule tested across all relevant methods
- [ ] Repository/spy usage where appropriate

### Overall Quality:

- [ ] All tests pass
- [ ] No test dependencies (tests can run in any order)
- [ ] Faker used for all test data generation
- [ ] Custom errors properly tested with CustomError
- [ ] TypeScript types properly used
- [ ] No console.log or debugging code left
- [ ] Code follows project style guidelines

### Test Execution Workflow (Required):

After writing/updating test files, execute tests in this order:

- [ ] **Step 1**: Test each individual file as you create/modify it

  ```bash
  pnpm --filter @repo/backend-modules-postgres test:file --name=<path-to-test-file>
  ```

  - Run this after creating/modifying each test file
  - Verify the specific test file passes
  - Fix any issues before moving to the next file

- [ ] **Step 2**: Test the entire domain after all tests are written

  ```bash
  pnpm --filter @repo/backend-modules-postgres test:domain --name=<domain-name>
  ```

  - Run this after completing all method and rule tests for the domain
  - Verify all domain tests pass together
  - Ensure no conflicts between test files

- [ ] **Step 3**: Test all services as final validation

  ```bash
  pnpm --filter @repo/backend-modules-postgres test:all
  ```

  - Run this before marking the task as complete
  - Ensure no regressions in other domains
  - Confirm the entire module test suite passes

**Example for User domain:**

```bash
# Step 1: Test individual files (repeat for each file)
pnpm --filter @repo/backend-modules-postgres test:file --name=src/services/user.test/methods/create-user.test.ts
pnpm --filter @repo/backend-modules-postgres test:file --name=src/services/user.test/methods/update-user.test.ts
# ... test each file individually ...

# Step 2: Test entire User domain
pnpm --filter @repo/backend-modules-postgres test:domain --name=user

# Step 3: Test all services
pnpm --filter @repo/backend-modules-postgres test:all
```

Only proceed to the next step if the current step passes successfully. If any step fails, fix the issues and re-run that step before continuing.
