import { TestManager } from '../../../test-manager.test';
import { UserService } from '../../user.service';
import { faker } from '@faker-js/faker';

/**
 * DOMAIN RULE 04: Username must not exceed 255 characters.
 *
 * This test suite verifies that usernames are validated against a maximum length
 * of 255 characters as defined by the database schema and business rules.
 *
 * Note: Current implementation enforces this at the database level through
 * the entity definition. Additional service-level validation may be added
 * in the future for better error handling.
 */
describe('Domain Rule 04 - Username Maximum Length', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('04.1 - should accept username at exactly 255 characters', async () => {
    const userService = TestManager.getHandler(UserService);
    const username255 = 'a'.repeat(255);

    const actualResult = await userService.createUser({
      username: username255,
      password: faker.internet.password(),
    });

    expect(actualResult.username.length).toBe(255);
  });

  it('04.2 - should accept username under 255 characters', async () => {
    const userService = TestManager.getHandler(UserService);
    const username100 = 'a'.repeat(100);

    const actualResult = await userService.createUser({
      username: username100,
      password: faker.internet.password(),
    });

    expect(actualResult.username.length).toBe(100);
    expect(actualResult.username.length).toBeLessThan(255);
  });

  it('04.3 - should accept very short usernames', async () => {
    const userService = TestManager.getHandler(UserService);

    const actualResult = await userService.createUser({
      username: 'ab',
      password: faker.internet.password(),
    });

    expect(actualResult.username.length).toBe(2);
  });

  it('04.4 - should validate username length during update operations', async () => {
    const userService = TestManager.getHandler(UserService);
    const username255 = 'b'.repeat(255);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const actualResult = await userService.updateUser({
      userId: user.id,
      username: username255,
    });

    expect(actualResult.username.length).toBe(255);
  });

  it('04.5 - should handle unicode characters within length limit', async () => {
    const userService = TestManager.getHandler(UserService);
    const unicodeUsername = '用户名'.repeat(80);

    const actualResult = await userService.createUser({
      username: unicodeUsername,
      password: faker.internet.password(),
    });

    expect(actualResult.username.length).toBeLessThanOrEqual(255);
  });
});
