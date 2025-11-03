import {
  CustomError,
  USER_NOT_FOUND,
  USER_USERNAME_ALREADY_EXISTS,
  USER_USERNAME_EMPTY,
  USER_PASSWORD_EMPTY,
} from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { UserService } from '../../user.service';
import { faker } from '@faker-js/faker';

describe('UserService - updateUser', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should update username when provided', async () => {
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

  it('should update password when provided', async () => {
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const newPassword = faker.internet.password();

    const actualResult = await userService.updateUser({
      userId: user.id,
      password: newPassword,
    });

    expect(actualResult.id).toBe(user.id);
  });

  it('should update both username and password when provided', async () => {
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const newUsername = faker.internet.username();
    const newPassword = faker.internet.password();

    const actualResult = await userService.updateUser({
      userId: user.id,
      username: newUsername,
      password: newPassword,
    });

    expect(actualResult.username).toBe(newUsername);
  });

  it('should throw USER_NOT_FOUND when user does not exist', async () => {
    const userService = TestManager.getHandler(UserService);

    await expect(
      userService.updateUser({
        userId: faker.string.uuid(),
        username: faker.internet.username(),
      }),
    ).rejects.toThrow(new CustomError(USER_NOT_FOUND));
  });

  it('should throw USER_USERNAME_EMPTY when username is only whitespace', async () => {
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

  it('should throw USER_PASSWORD_EMPTY when password is only whitespace', async () => {
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

  it('should throw USER_USERNAME_ALREADY_EXISTS when new username is taken by another user', async () => {
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

  it('should not update when username is the same as current', async () => {
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

  it('should trim username before updating', async () => {
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const newUsername = faker.internet.username();

    const actualResult = await userService.updateUser({
      userId: user.id,
      username: `  ${newUsername}  `,
    });

    expect(actualResult.username).toBe(newUsername);
  });
});
