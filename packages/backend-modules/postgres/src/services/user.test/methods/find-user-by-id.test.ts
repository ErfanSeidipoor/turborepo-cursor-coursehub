import { CustomError, USER_NOT_FOUND } from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { UserService } from '../../user.service';
import { faker } from '@faker-js/faker';

describe('UserService - findUserById', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should return a user when found with valid userId', async () => {
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const actualResult = await userService.findUserById({ userId: user.id });

    expect(actualResult).toBeDefined();
    expect(actualResult?.id).toBe(user.id);
    expect(actualResult?.username).toBe(user.username);
  });

  it('should return undefined when userId is not provided and returnError is false', async () => {
    const userService = TestManager.getHandler(UserService);

    const actualResult = await userService.findUserById({
      userId: '',
      returnError: false,
    });

    expect(actualResult).toBeUndefined();
  });

  it('should throw USER_NOT_FOUND when userId is not provided and returnError is true', async () => {
    const userService = TestManager.getHandler(UserService);

    await expect(
      userService.findUserById({
        userId: '',
        returnError: true,
      }),
    ).rejects.toThrow(new CustomError(USER_NOT_FOUND));
  });

  it('should return undefined when user is not found and returnError is false', async () => {
    const userService = TestManager.getHandler(UserService);

    const actualResult = await userService.findUserById({
      userId: faker.string.uuid(),
      returnError: false,
    });

    expect(actualResult).toBeNull();
  });

  it('should throw USER_NOT_FOUND when user is not found and returnError is true', async () => {
    const userService = TestManager.getHandler(UserService);

    await expect(
      userService.findUserById({
        userId: faker.string.uuid(),
        returnError: true,
      }),
    ).rejects.toThrow(new CustomError(USER_NOT_FOUND));
  });

  it('should include relations when provided', async () => {
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const actualResult = await userService.findUserById({
      userId: user.id,
      relations: {},
    });

    expect(actualResult).toBeDefined();
    expect(actualResult?.id).toBe(user.id);
  });
});
