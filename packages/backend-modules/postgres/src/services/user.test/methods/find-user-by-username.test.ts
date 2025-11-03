import { CustomError, USER_NOT_FOUND } from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { UserService } from '../../user.service';
import { faker } from '@faker-js/faker';

describe('UserService - findUserByUsername', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should return a user when found with valid username', async () => {
    const userService = TestManager.getHandler(UserService);
    const username = faker.internet.username();

    await userService.createUser({
      username,
      password: faker.internet.password(),
    });

    const actualResult = await userService.findUserByUsername({ username });

    expect(actualResult).toBeDefined();
    expect(actualResult?.username).toBe(username);
  });

  it('should include password when includePassword is true', async () => {
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

  it('should return undefined when username is not provided and returnError is false', async () => {
    const userService = TestManager.getHandler(UserService);

    const actualResult = await userService.findUserByUsername({
      username: '',
      returnError: false,
    });

    expect(actualResult).toBeUndefined();
  });

  it('should throw USER_NOT_FOUND when username is not provided and returnError is true', async () => {
    const userService = TestManager.getHandler(UserService);

    await expect(
      userService.findUserByUsername({
        username: '',
        returnError: true,
      }),
    ).rejects.toThrow(new CustomError(USER_NOT_FOUND));
  });

  it('should return undefined when user is not found and returnError is false', async () => {
    const userService = TestManager.getHandler(UserService);

    const actualResult = await userService.findUserByUsername({
      username: faker.internet.username(),
      returnError: false,
    });

    expect(actualResult).toBeNull();
  });

  it('should throw USER_NOT_FOUND when user is not found and returnError is true', async () => {
    const userService = TestManager.getHandler(UserService);

    await expect(
      userService.findUserByUsername({
        username: faker.internet.username(),
        returnError: true,
      }),
    ).rejects.toThrow(new CustomError(USER_NOT_FOUND));
  });
});
