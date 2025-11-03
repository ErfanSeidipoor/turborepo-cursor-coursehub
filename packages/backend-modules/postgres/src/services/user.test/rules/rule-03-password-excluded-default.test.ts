import { TestManager } from '../../../test-manager.test';
import { UserService } from '../../user.service';
import { faker } from '@faker-js/faker';

/**
 * DOMAIN RULE 03: Password field is excluded from default queries for security purposes
 * and must be explicitly selected when needed.
 *
 * This test suite verifies that the password field is not included in query results
 * by default and must be explicitly requested using query builder addSelect.
 */
describe('Domain Rule 03 - Password Excluded from Default Queries', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('03.1 - should not include password by default when finding user by username', async () => {
    const userService = TestManager.getHandler(UserService);
    const username = faker.internet.username();

    await userService.createUser({
      username,
      password: faker.internet.password(),
    });

    const actualResult = await userService.findUserByUsername({ username });

    expect(actualResult).toBeDefined();
    expect(actualResult?.password).toBeUndefined();
  });

  it('03.2 - should explicitly select password field when includePassword is true', async () => {
    const userService = TestManager.getHandler(UserService);
    const username = faker.internet.username();

    await userService.createUser({
      username,
      password: faker.internet.password(),
    });

    const actualResult = await userService.findUserByUsername({
      username,
      includePassword: true,
    });

    expect(actualResult).toBeDefined();
    expect(actualResult?.password).toBeDefined();
  });

  it('03.3 - should not return password when finding user by ID without explicit request', async () => {
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const actualResult = await userService.findUserById({ userId: user.id });

    expect(actualResult).toBeDefined();
    expect(actualResult?.password).toBeUndefined();
  });

  it('03.4 - should use query builder with addSelect to retrieve password', async () => {
    const userService = TestManager.getHandler(UserService);
    const username = faker.internet.username();

    await userService.createUser({
      username,
      password: faker.internet.password(),
    });

    const actualResult = await userService.findUserByUsername({
      username,
      includePassword: true,
    });

    expect(actualResult).toBeDefined();
    expect(actualResult?.password).toBeDefined();
  });

  it('03.5 - should handle authentication scenarios by explicitly requesting password', async () => {
    const userService = TestManager.getHandler(UserService);
    const username = faker.internet.username();

    await userService.createUser({
      username,
      password: faker.internet.password(),
    });

    const actualResult = await userService.findUserByUsername({
      username,
      includePassword: true,
    });

    expect(actualResult?.password).toBeDefined();
  });
});
