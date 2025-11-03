# Integration Tests Setup

Complete guide to set up and run integration tests with a real PostgreSQL database.

## 🚀 Quick Start (3 Steps)

### 1. Start Test Database

Using Docker Compose (recommended):

```bash
# Start PostgreSQL test database
docker-compose -f docker-compose.test.yml up -d

# Verify it's running
docker-compose -f docker-compose.test.yml ps
```

Or using Docker CLI:

```bash
docker run --name postgres-test \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_password \
  -e POSTGRES_DB=user_service_test \
  -p 5433:5432 \
  -d postgres:15
```

### 2. Configure Environment

```bash
# Copy example configuration
cp .env.test.example .env.test

# Edit if needed (defaults work with Docker Compose)
nano .env.test
```

### 3. Run Tests

```bash
# Run all integration tests
pnpm test:integration

# Or run with coverage
pnpm test:integration:coverage
```

## 📋 What's Included

### Files Created

- ✅ `test-database-setup.ts` - Database connection and utilities
- ✅ `test-setup-integration.ts` - Integration test context setup
- ✅ `methods/create-user-integration.test.ts` - Example integration test
- ✅ `jest.config.integration.js` - Jest configuration for integration tests
- ✅ `jest.integration.setup.js` - Test environment setup
- ✅ `docker-compose.test.yml` - Docker Compose for test database
- ✅ `.env.test.example` - Environment configuration template
- ✅ Documentation files

### NPM Scripts Added

```json
{
  "test:integration": "Run all integration tests",
  "test:integration:watch": "Run in watch mode",
  "test:integration:coverage": "Run with coverage report"
}
```

## 🎯 Integration vs Unit Tests

| Aspect          | Unit Tests                 | Integration Tests            |
| --------------- | -------------------------- | ---------------------------- |
| **Database**    | Mocked with Jest           | Real PostgreSQL              |
| **File Suffix** | `.test.ts`                 | `.integration.test.ts`       |
| **Speed**       | Very Fast (~3s)            | Fast (~10-30s)               |
| **Command**     | `pnpm test`                | `pnpm test:integration`      |
| **Setup**       | Mock reset                 | Database cleanup             |
| **When to Use** | Business logic, validation | Database operations, queries |

## 📝 Writing Integration Tests

### Basic Structure

```typescript
import {
  setupIntegrationTestContext,
  clearTestDatabase,
  closeIntegrationTestDatabase,
  seedUsers,
  IntegrationTestContext,
} from '../test-setup-integration';

describe('UserService - methodName (Integration)', () => {
  let context: IntegrationTestContext;

  // Connect to database (once for all tests)
  beforeAll(async () => {
    context = await setupIntegrationTestContext();
  });

  // Clear data after each test for isolation
  afterEach(async () => {
    await clearTestDatabase(context);
  });

  // Close connection after all tests
  afterAll(async () => {
    await closeIntegrationTestDatabase();
  });

  it('should perform real database operation', async () => {
    // Arrange: Seed test data
    const [existingUser] = await seedUsers(context.dataSource, [
      { username: 'john', password: 'hashed_password' },
    ]);

    // Act: Call service method
    const result = await context.service.findUserById({
      userId: existingUser.id,
    });

    // Assert: Verify real database results
    expect(result).toBeDefined();
    expect(result?.username).toBe('john');
  });
});
```

### Key Differences from Unit Tests

#### ❌ Don't Mock (Unit Test Pattern)

```typescript
// Unit test - mocked
(mockRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
```

#### ✅ Use Real Database (Integration Test Pattern)

```typescript
// Integration test - real database
const user = await context.service.createUser({
  username: 'john',
  password: 'secret',
});
```

## 🛠️ Available Utilities

### `setupIntegrationTestContext()`

Creates and returns test context with real database connection.

```typescript
const context = await setupIntegrationTestContext();
// context.service - UserService with real repository
// context.dataSource - TypeORM DataSource for direct DB access
```

### `clearTestDatabase(context)`

Truncates all tables, resets sequences. Call in `afterEach`.

```typescript
afterEach(async () => {
  await clearTestDatabase(context);
});
```

### `closeIntegrationTestDatabase()`

Closes database connection. Call in `afterAll`.

```typescript
afterAll(async () => {
  await closeIntegrationTestDatabase();
});
```

### `seedUsers(dataSource, users[])`

Seeds test users into database.

```typescript
const users = await seedUsers(context.dataSource, [
  { username: 'user1', password: 'pass1' },
  { username: 'user2', password: 'pass2' },
]);
```

## 🔍 Example: Converting Unit Test to Integration Test

### Before (Unit Test with Mocks)

```typescript
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

  it('should create a new user with valid input', async () => {
    const mockUser: Partial<User> = {
      id: '123',
      username: 'testuser',
      password: 'hashed_password',
    };

    (context.mockRepository.findOne as jest.Mock).mockResolvedValue(null);
    (context.mockRepository.create as jest.Mock).mockReturnValue(mockUser);
    (context.mockRepository.save as jest.Mock).mockResolvedValue(mockUser);

    const result = await context.service.createUser({
      username: 'testuser',
      password: 'testpass123',
    });

    expect(result).toEqual(mockUser);
  });
});
```

### After (Integration Test with Real Database)

```typescript
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

  it('should create a new user with valid input', async () => {
    const result = await context.service.createUser({
      username: 'testuser',
      password: 'testpass123',
    });

    // Verify real database behavior
    expect(result.id).toBeDefined();
    expect(result.username).toBe('testuser');
    expect(result.password).not.toBe('testpass123'); // Should be hashed
    expect(result.createdAt).toBeDefined();

    // Verify it's actually in the database
    const fetched = await context.service.findUserById({
      userId: result.id,
    });
    expect(fetched).toBeDefined();
  });
});
```

## 📊 Running Tests

### All Integration Tests

```bash
pnpm test:integration
```

### Watch Mode (Auto-rerun on changes)

```bash
pnpm test:integration:watch
```

### With Coverage Report

```bash
pnpm test:integration:coverage
```

### Specific Test File

```bash
pnpm test:integration create-user-integration
```

### Both Unit and Integration Tests

```bash
# Run unit tests
pnpm test

# Run integration tests
pnpm test:integration
```

## 🐳 Docker Management

### Start Test Database

```bash
docker-compose -f docker-compose.test.yml up -d
```

### View Logs

```bash
docker-compose -f docker-compose.test.yml logs -f
```

### Stop Test Database

```bash
docker-compose -f docker-compose.test.yml down
```

### Stop and Remove Data

```bash
docker-compose -f docker-compose.test.yml down -v
```

### Check Status

```bash
docker-compose -f docker-compose.test.yml ps
```

## 🔧 Troubleshooting

### Database Connection Fails

```bash
Error: connect ECONNREFUSED 127.0.0.1:5433
```

**Solution:**

```bash
# Check if database is running
docker-compose -f docker-compose.test.yml ps

# Restart if needed
docker-compose -f docker-compose.test.yml restart

# Check logs
docker-compose -f docker-compose.test.yml logs
```

### Port Already in Use

```bash
Error: port is already allocated
```

**Solution:**

```bash
# Option 1: Stop existing container
docker stop postgres-test

# Option 2: Change port in docker-compose.test.yml
# Change "5433:5432" to "5434:5432" and update .env.test
```

### Tests Are Slow

**Solutions:**

1. Connection is already pooled and reused
2. Use `--runInBand` to identify slow tests:
   ```bash
   pnpm test:integration --runInBand
   ```
3. Ensure database cleanup is efficient
4. Consider using SQLite for faster tests (if PostgreSQL-specific features not needed)

### Data Not Cleaning Between Tests

```bash
Error: duplicate key value violates unique constraint
```

**Solution:**

```bash
# Ensure afterEach is running
afterEach(async () => {
  await clearTestDatabase(context);
});

# Check test timeout isn't preventing cleanup
```

## 🚦 CI/CD Integration

### GitHub Actions Example

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: user_service_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run integration tests
        env:
          TEST_DB_HOST: localhost
          TEST_DB_PORT: 5432
          TEST_DB_USERNAME: test_user
          TEST_DB_PASSWORD: test_password
          TEST_DB_NAME: user_service_test
        run: pnpm test:integration:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage-integration/lcov.info
```

## 📚 Further Reading

- [INTEGRATION_TESTS.md](./src/services/user.test/INTEGRATION_TESTS.md) - Complete guide
- [README_INTEGRATION.md](./src/services/user.test/README_INTEGRATION.md) - Quick reference

## ✅ Next Steps

1. ✅ Set up test database (Docker)
2. ✅ Configure environment (`.env.test`)
3. ✅ Run example integration test
4. 📝 Convert existing unit tests (optional)
5. 📝 Write new integration tests for other methods
6. 🚀 Add to CI/CD pipeline

Happy testing! 🎉
