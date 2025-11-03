import {
  CustomError,
  USER_NOT_FOUND,
  USER_USERNAME_REQUIRED,
} from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { UserService } from '../../user.service';
import { faker } from '@faker-js/faker';

describe('UserService - getUserByUsernameWithPassword', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should return a user with password when found with valid username', async () => {
    const userService = TestManager.getHandler(UserService);
    const username = faker.internet.username();
    const password = faker.internet.password();

    await userService.createUser({
      username,
      password,
    });

    const actualResult = await userService.getUserByUsernameWithPassword({
      username,
    });

    expect(actualResult).toBeDefined();
    expect(actualResult?.username).toBe(username);
    expect(actualResult?.password).toBeDefined();
  });

  it('should return password field in the result', async () => {
    const userService = TestManager.getHandler(UserService);
    const username = faker.internet.username();
    const password = faker.internet.password();

    await userService.createUser({
      username,
      password,
    });

    const actualResult = await userService.getUserByUsernameWithPassword({
      username,
    });

    expect(actualResult).toBeDefined();
    expect(actualResult?.password).toBeDefined();
    expect(typeof actualResult?.password).toBe('string');
  });

  it('should return undefined when username is not provided and returnError is false', async () => {
    const userService = TestManager.getHandler(UserService);

    const actualResult = await userService.getUserByUsernameWithPassword({
      username: '',
      returnError: false,
    });

    expect(actualResult).toBeUndefined();
  });

  it('should throw USER_USERNAME_REQUIRED when username is not provided and returnError is true', async () => {
    const userService = TestManager.getHandler(UserService);

    await expect(
      userService.getUserByUsernameWithPassword({
        username: '',
        returnError: true,
      }),
    ).rejects.toThrow(new CustomError(USER_USERNAME_REQUIRED));
  });

  it('should return undefined when user is not found and returnError is false', async () => {
    const userService = TestManager.getHandler(UserService);

    const actualResult = await userService.getUserByUsernameWithPassword({
      username: faker.internet.username(),
      returnError: false,
    });

    expect(actualResult).toBeUndefined();
  });

  it('should throw USER_NOT_FOUND when user is not found and returnError is true', async () => {
    const userService = TestManager.getHandler(UserService);

    await expect(
      userService.getUserByUsernameWithPassword({
        username: faker.internet.username(),
        returnError: true,
      }),
    ).rejects.toThrow(new CustomError(USER_NOT_FOUND));
  });
});
