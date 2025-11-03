# Complete Testing Guide

This guide covers both **unit tests** (with mocks) and **integration tests** (with real database).

## 📚 Table of Contents

- [Quick Start](#quick-start)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [When to Use Which](#when-to-use-which)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)

## 🚀 Quick Start

### Unit Tests (Fast, Mocked)

```bash
# Run all unit tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage
```

### Integration Tests (Real Database)

```bash
# 1. Start test database
docker-compose -f docker-compose.test.yml up -d

# 2. Copy environment config
cp env.test.example .env.test

# 3. Run integration tests
pnpm test:integration
```

## 🎯 Unit Tests

### Overview

- **Fast**: ~3 seconds for all tests
- **Isolated**: No external dependencies
- **Mocked**: Database operations are mocked
- **Files**: `*.test.ts` (not `*.integration.test.ts`)

### When to Use

✅ Business logic validation  
✅ Error handling  
✅ Input validation  
✅ Edge cases  
✅ Fast feedback loops

### Example

```typescript
import { setupTestContext, clearMocks, TestContext } from '../test-setup';
import * as passwordHelper from '@repo/back-share/helpers/password';

describe('UserService - createUser', () => {
  let context: TestContext;
  let generateHashPasswordSpy: jest.SpyInstance;

  beforeEach(async () => {
    context = await setupTestContext();
    generateHashPasswordSpy = jest
      .spyOn(passwordHelper, 'generateHashPassword')
      .mockResolvedValue('hashed_password');
  });

  afterEach(() => {
    clearMocks();
    generateHashPasswordSpy.mockRestore();
  });

  it('should throw error when username is empty', async () => {
    await expect(
      context.service.createUser({ username: '', password: 'pass' }),
    ).rejects.toThrow();
  });
});
```

### Available Files

```
src/services/user.test/
├── test-setup.ts                    # Unit test setup with mocks
├── methods/                         # Method-specific unit tests
│   ├── create-user.test.ts
│   ├── find-user-by-id.test.ts
│   ├── find-user-by-username.test.ts
│   ├── update-user.test.ts
│   ├── delete-user.test.ts
│   └── find-users.test.ts
└── domain-rules/                    # Domain rule validation
    ├── rule-01-username-unique.test.ts
    ├── rule-02-password-hashed.test.ts
    └── ... (8 rule test files)
```

## 🔌 Integration Tests

### Overview

- **Real Database**: Uses PostgreSQL
- **Slower**: ~10-30 seconds for all tests
- **High Confidence**: Tests actual database behavior
- **Files**: `*.integration.test.ts`

### When to Use

✅ Database operations  
✅ Complex queries with joins  
✅ Transaction handling  
✅ Data integrity constraints  
✅ Migration validation

### Setup

#### 1. Start Test Database

Using Docker Compose:

```bash
docker-compose -f docker-compose.test.yml up -d
```

Or Docker CLI:

```bash
docker run --name postgres-test \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_password \
  -e POSTGRES_DB=user_service_test \
  -p 5433:5432 \
  -d postgres:15
```

#### 2. Configure Environment

```bash
cp env.test.example .env.test
```

Edit `.env.test` if needed:

```env
TEST_DB_HOST=localhost
TEST_DB_PORT=5433
TEST_DB_USERNAME=test_user
TEST_DB_PASSWORD=test_password
TEST_DB_NAME=user_service_test
```

### Example

```typescript
import {
  setupIntegrationTestContext,
  clearTestDatabase,
  closeIntegrationTestDatabase,
  IntegrationTestContext,
} from '../test-setup-integration';
import { seedUsers } from '../test-database-setup';

describe('UserService - createUser (Integration)', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await setupIntegrationTestContext();
  });

  afterEach(async () => {
    await clearTestDatabase(context);
  });

  afterAll(async () => {
    await closeIntegrationTestDatabase();
  });

  it('should persist user to database', async () => {
    const created = await context.service.createUser({
      username: 'john',
      password: 'secret',
    });

    // Verify in database
    const fetched = await context.service.findUserById({
      userId: created.id,
    });

    expect(fetched).toBeDefined();
    expect(fetched?.username).toBe('john');
  });

  it('should enforce unique username constraint', async () => {
    await seedUsers(context.dataSource, [
      { username: 'john', password: 'pass1' },
    ]);

    await expect(
      context.service.createUser({ username: 'john', password: 'pass2' }),
    ).rejects.toThrow();
  });
});
```

### Available Files

```
src/services/user.test/
├── test-database-setup.ts           # Database connection utilities
├── test-setup-integration.ts        # Integration test context
└── methods/
    └── create-user-integration.test.ts  # Example integration test
```

## 🔄 When to Use Which

| Scenario                  | Unit Test | Integration Test |
| ------------------------- | --------- | ---------------- |
| Validate input parameters | ✅        | ❌               |
| Test error messages       | ✅        | ❌               |
| Test business logic       | ✅        | ❌               |
| Test database queries     | ❌        | ✅               |
| Test unique constraints   | ❌        | ✅               |
| Test foreign keys         | ❌        | ✅               |
| Test transactions         | ❌        | ✅               |
| Test data integrity       | ❌        | ✅               |
| Fast feedback             | ✅        | ❌               |
| CI/CD (every commit)      | ✅        | ⚠️               |

**Recommendation**: Use **both**!

- Unit tests for fast feedback and business logic
- Integration tests for database operations and confidence

## 📊 Test Structure Comparison

### Unit Test Structure

```typescript
describe('ServiceName - methodName', () => {
  let context: TestContext;

  beforeEach(async () => {
    context = await setupTestContext();
    // Setup mocks
  });

  afterEach(() => {
    clearMocks();
  });

  it('should ...', async () => {
    // Mock setup
    (context.mockRepository.method as jest.Mock).mockResolvedValue(data);

    // Call service
    const result = await context.service.method();

    // Assert
    expect(result).toEqual(expectedData);
  });
});
```

### Integration Test Structure

```typescript
describe('ServiceName - methodName (Integration)', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await setupIntegrationTestContext();
  });

  afterEach(async () => {
    await clearTestDatabase(context);
  });

  afterAll(async () => {
    await closeIntegrationTestDatabase();
  });

  it('should ...', async () => {
    // Seed data if needed
    await seedUsers(context.dataSource, [{ ...data }]);

    // Call service
    const result = await context.service.method();

    // Assert real database behavior
    expect(result).toBeDefined();

    // Verify in database
    const fetched = await context.service.findById(result.id);
    expect(fetched).toBeDefined();
  });
});
```

## 🏃 Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Watch mode (auto-rerun)
pnpm test:watch

# With coverage
pnpm test:coverage

# Specific file
pnpm test create-user.test
```

### Integration Tests

```bash
# Run all integration tests
pnpm test:integration

# Watch mode
pnpm test:integration:watch

# With coverage
pnpm test:integration:coverage

# Specific file
pnpm test:integration create-user-integration
```

### Both

```bash
# Run all tests (unit + integration)
pnpm test && pnpm test:integration

# Or sequentially
pnpm test:all  # If added to package.json
```

## 📈 Test Coverage

### Unit Tests

- **114 tests** across all files
- **98.73%** statement coverage
- **94.87%** branch coverage
- **100%** function coverage

### Integration Tests

- Tests real database behavior
- Validates data integrity
- Ensures production-like behavior

## 🔧 Utilities

### Unit Test Utilities (`test-setup.ts`)

```typescript
// Setup test context with mocks
const context = await setupTestContext();
// context.service - UserService
// context.mockRepository - Mocked repository
// context.mockQueryBuilder - Mocked query builder

// Clear all mocks
clearMocks();
```

### Integration Test Utilities (`test-setup-integration.ts`)

All utilities are now in a single file for convenience:

```typescript
// Setup with real database
const context = await setupIntegrationTestContext();
// context.service - UserService with real repository
// context.dataSource - TypeORM DataSource
// context.module - TestingModule

// Seed users
const users = await seedUsers(context.dataSource, [
  { username: 'user1', password: 'pass1' },
  { username: 'user2', password: 'pass2' },
]);

// Clear database data
await clearTestDatabase(context);

// Close connection
await closeIntegrationTestDatabase();
```

## 📝 Best Practices

### For Unit Tests

1. ✅ Test one thing per test
2. ✅ Use descriptive test names
3. ✅ Follow Arrange-Act-Assert pattern
4. ✅ Mock external dependencies
5. ✅ Keep tests fast (<100ms each)

### For Integration Tests

1. ✅ Use real database operations
2. ✅ Clean database after each test
3. ✅ Seed only necessary data
4. ✅ Test database constraints
5. ✅ Verify data persistence

### General

1. ✅ Write tests before fixing bugs
2. ✅ Maintain high coverage (>90%)
3. ✅ Run tests before committing
4. ✅ Keep tests maintainable
5. ✅ Document complex test scenarios

## 🐛 Troubleshooting

### Unit Tests

**Problem**: Mock not working

```typescript
// ❌ Wrong
import { generateHashPassword } from '@repo/back-share/helpers/password';

// ✅ Correct
import * as passwordHelper from '@repo/back-share/helpers/password';
const spy = jest.spyOn(passwordHelper, 'generateHashPassword');
```

### Integration Tests

**Problem**: Database connection fails

```bash
# Check if database is running
docker-compose -f docker-compose.test.yml ps

# Check logs
docker-compose -f docker-compose.test.yml logs

# Restart
docker-compose -f docker-compose.test.yml restart
```

**Problem**: Tests fail with duplicate key

```typescript
// Ensure cleanup is working
afterEach(async () => {
  await clearTestDatabase(context); // Add this!
});
```

## 📚 Further Reading

- [README.md](./src/services/user.test/README.md) - Unit test documentation
- [INTEGRATION_TESTS.md](./src/services/user.test/INTEGRATION_TESTS.md) - Complete integration guide
- [INTEGRATION_SETUP.md](./INTEGRATION_SETUP.md) - Integration test setup

## ✅ Checklist

### Setting Up Tests

- [ ] Install dependencies (`pnpm install`)
- [ ] Run unit tests (`pnpm test`)
- [ ] Start test database (`docker-compose up`)
- [ ] Configure `.env.test`
- [ ] Run integration tests (`pnpm test:integration`)

### Writing Tests

- [ ] Write unit tests for business logic
- [ ] Write integration tests for database operations
- [ ] Follow naming conventions
- [ ] Add test descriptions
- [ ] Maintain >90% coverage

### Before Committing

- [ ] Run `pnpm test` (unit tests)
- [ ] Run `pnpm test:integration` (if modified DB code)
- [ ] Check coverage reports
- [ ] Fix any failing tests

Happy Testing! 🎉
