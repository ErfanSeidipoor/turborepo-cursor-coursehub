import {
  CustomError,
  USER_USERNAME_REQUIRED,
  USER_PASSWORD_REQUIRED,
  USER_USERNAME_EMPTY,
  USER_PASSWORD_EMPTY,
} from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { UserService } from '../../user.service';
import { faker } from '@faker-js/faker';

/**
 * DOMAIN RULE 06: User credentials (username and password) are required fields
 * and cannot be null.
 *
 * This test suite verifies that both username and password are mandatory
 * fields when creating a user, and that empty or whitespace-only values
 * are rejected.
 */
describe('Domain Rule 06 - Credentials Required', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('06.1 - should reject user creation when username is missing', async () => {
    const userService = TestManager.getHandler(UserService);

    await expect(
      userService.createUser({
        username: '',
        password: faker.internet.password(),
      }),
    ).rejects.toThrow(new CustomError(USER_USERNAME_REQUIRED));
  });

  it('06.2 - should reject user creation when password is missing', async () => {
    const userService = TestManager.getHandler(UserService);

    await expect(
      userService.createUser({
        username: faker.internet.username(),
        password: '',
      }),
    ).rejects.toThrow(new CustomError(USER_PASSWORD_REQUIRED));
  });

  it('06.3 - should reject username with only whitespace characters', async () => {
    const userService = TestManager.getHandler(UserService);

    await expect(
      userService.createUser({
        username: '   ',
        password: faker.internet.password(),
      }),
    ).rejects.toThrow(new CustomError(USER_USERNAME_EMPTY));
  });

  it('06.4 - should reject password with only whitespace characters', async () => {
    const userService = TestManager.getHandler(UserService);

    await expect(
      userService.createUser({
        username: faker.internet.username(),
        password: '   ',
      }),
    ).rejects.toThrow(new CustomError(USER_PASSWORD_EMPTY));
  });

  it('06.5 - should accept valid username and password combination', async () => {
    const userService = TestManager.getHandler(UserService);
    const username = faker.internet.username();

    const actualResult = await userService.createUser({
      username,
      password: faker.internet.password(),
    });

    expect(actualResult.username).toBe(username);
    expect(actualResult.id).toBeDefined();
  });

  it('06.6 - should reject updating username to empty value', async () => {
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    await expect(
      userService.updateUser({
        userId: user.id,
        username: '   ',
      }),
    ).rejects.toThrow(new CustomError(USER_USERNAME_EMPTY));
  });

  it('06.7 - should reject updating password to empty value', async () => {
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    await expect(
      userService.updateUser({
        userId: user.id,
        password: '   ',
      }),
    ).rejects.toThrow(new CustomError(USER_PASSWORD_EMPTY));
  });

  it('06.8 - should enforce credential requirements at service layer', async () => {
    const userService = TestManager.getHandler(UserService);

    await expect(
      userService.createUser({
        username: '',
        password: '',
      }),
    ).rejects.toThrow(CustomError);
  });
});
