import { CustomError, USER_USERNAME_ALREADY_EXISTS } from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { UserService } from '../../user.service';
import { faker } from '@faker-js/faker';

/**
 * DOMAIN RULE 01: Username must be unique across all users in the system.
 *
 * This test suite verifies that the UserService enforces username uniqueness
 * across all user accounts in the system. No two users can share the same username.
 */
describe('Domain Rule 01 - Username Uniqueness', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('01.1 - should prevent creating a new user with an existing username', async () => {
    const userService = TestManager.getHandler(UserService);
    const username = faker.internet.username();

    await userService.createUser({
      username,
      password: faker.internet.password(),
    });

    await expect(
      userService.createUser({
        username,
        password: faker.internet.password(),
      }),
    ).rejects.toThrow(new CustomError(USER_USERNAME_ALREADY_EXISTS));
  });

  it('01.2 - should prevent updating a user to a username that already exists', async () => {
    const userService = TestManager.getHandler(UserService);

    const user1 = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const user2 = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    await expect(
      userService.updateUser({
        userId: user2.id,
        username: user1.username,
      }),
    ).rejects.toThrow(new CustomError(USER_USERNAME_ALREADY_EXISTS));
  });

  it('01.3 - should allow creating a user with a unique username', async () => {
    const userService = TestManager.getHandler(UserService);
    const username = faker.internet.username();

    const actualResult = await userService.createUser({
      username,
      password: faker.internet.password(),
    });

    expect(actualResult.username).toBe(username);
    expect(actualResult.id).toBeDefined();
  });

  it('01.4 - should allow updating username to a new unique value', async () => {
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const newUsername = faker.internet.username();

    const actualResult = await userService.updateUser({
      userId: user.id,
      username: newUsername,
    });

    expect(actualResult.username).toBe(newUsername);
  });

  it('01.5 - should allow user to keep their current username during update', async () => {
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const actualResult = await userService.updateUser({
      userId: user.id,
      username: user.username,
    });

    expect(actualResult.username).toBe(user.username);
  });
});
