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

describe('UserService - createUser (Integration)', () => {
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

    expect(actualResult).toBeDefined();
    expect(actualResult.id).toBeDefined();
    expect(actualResult.username).toBe(username);
    expect(actualResult.password).toBeDefined();
    expect(actualResult.password).not.toBe(password);
    expect(actualResult.createdAt).toBeDefined();
    expect(actualResult.updatedAt).toBeDefined();
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
    expect(actualResult.username).not.toContain(' ');
  });

  it('should generate UUID for user ID', async () => {
    const userService = TestManager.getHandler(UserService);

    const actualResult = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    expect(actualResult.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('should automatically set createdAt and updatedAt timestamps', async () => {
    const userService = TestManager.getHandler(UserService);

    const beforeCreate = new Date();
    const actualResult = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    expect(actualResult.createdAt).toBeDefined();
    expect(actualResult.updatedAt).toBeDefined();
    expect(actualResult.createdAt!.getTime()).toBeGreaterThanOrEqual(
      beforeCreate.getTime(),
    );

    const afterCreate = new Date();
    expect(actualResult.createdAt!.getTime()).toBeLessThanOrEqual(
      afterCreate.getTime(),
    );
  });

  it('should persist user to database', async () => {
    const userService = TestManager.getHandler(UserService);

    const createdUser = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const fetchedUser = await userService.findUserById({
      userId: createdUser.id,
    });

    expect(fetchedUser).toBeDefined();
    expect(fetchedUser?.id).toBe(createdUser.id);
    expect(fetchedUser?.username).toBe(createdUser.username);
  });
});
