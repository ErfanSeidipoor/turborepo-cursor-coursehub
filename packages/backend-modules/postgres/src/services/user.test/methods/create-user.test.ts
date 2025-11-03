import {
  CustomError,
  USER_USERNAME_ALREADY_EXISTS,
  USER_USERNAME_REQUIRED,
  USER_PASSWORD_REQUIRED,
  USER_USERNAME_EMPTY,
  USER_PASSWORD_EMPTY,
} from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { UserService } from '../../user.service';
import { faker } from '@faker-js/faker';

describe('UserService - createUser', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should create a new user with valid input', async () => {
    const userService = TestManager.getHandler(UserService);
    const username = faker.internet.username();
    const password = faker.internet.password();

    const actualResult = await userService.createUser({
      username,
      password,
    });

    expect(actualResult.username).toBe(username);
    expect(actualResult.id).toBeDefined();
  });

  it('should throw USER_USERNAME_REQUIRED when username is not provided', async () => {
    const userService = TestManager.getHandler(UserService);

    await expect(
      userService.createUser({
        username: '',
        password: faker.internet.password(),
      }),
    ).rejects.toThrow(new CustomError(USER_USERNAME_REQUIRED));
  });

  it('should throw USER_PASSWORD_REQUIRED when password is not provided', async () => {
    const userService = TestManager.getHandler(UserService);

    await expect(
      userService.createUser({
        username: faker.internet.username(),
        password: '',
      }),
    ).rejects.toThrow(new CustomError(USER_PASSWORD_REQUIRED));
  });

  it('should throw USER_USERNAME_EMPTY when username contains only whitespace', async () => {
    const userService = TestManager.getHandler(UserService);

    await expect(
      userService.createUser({
        username: '   ',
        password: faker.internet.password(),
      }),
    ).rejects.toThrow(new CustomError(USER_USERNAME_EMPTY));
  });

  it('should throw USER_PASSWORD_EMPTY when password contains only whitespace', async () => {
    const userService = TestManager.getHandler(UserService);

    await expect(
      userService.createUser({
        username: faker.internet.username(),
        password: '   ',
      }),
    ).rejects.toThrow(new CustomError(USER_PASSWORD_EMPTY));
  });

  it('should throw USER_USERNAME_ALREADY_EXISTS when username is taken', async () => {
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

  it('should trim username before saving', async () => {
    const userService = TestManager.getHandler(UserService);
    const username = faker.internet.username();

    const actualResult = await userService.createUser({
      username: `  ${username}  `,
      password: faker.internet.password(),
    });

    expect(actualResult.username).toBe(username);
  });
});
