import * as passwordHelper from '@repo/back-share/helpers/password';
import { TestManager } from '../../../test-manager.test';
import { UserService } from '../../user.service';
import { faker } from '@faker-js/faker';
import { User } from '@repo/postgres/entities/user.entity';

/**
 * DOMAIN RULE 02: Password must be stored in hashed format only;
 * plain text passwords are never persisted.
 *
 * This test suite verifies that passwords are always hashed before being stored
 * in the database. Plain text passwords should never be persisted.
 */
describe('Domain Rule 02 - Password Hashing', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('02.1 - should hash password when creating a new user', async () => {
    const userService = TestManager.getHandler(UserService);
    const plainPassword = faker.internet.password();
    const username = faker.internet.username();

    const generateHashPasswordSpy = jest.spyOn(
      passwordHelper,
      'generateHashPassword',
    );

    await userService.createUser({
      username,
      password: plainPassword,
    });

    expect(generateHashPasswordSpy).toHaveBeenCalledWith(plainPassword);

    generateHashPasswordSpy.mockRestore();
  });

  it('02.2 - should hash password when updating user password', async () => {
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const newPlainPassword = faker.internet.password();
    const generateHashPasswordSpy = jest.spyOn(
      passwordHelper,
      'generateHashPassword',
    );

    await userService.updateUser({
      userId: user.id,
      password: newPlainPassword,
    });

    expect(generateHashPasswordSpy).toHaveBeenCalledWith(newPlainPassword);

    generateHashPasswordSpy.mockRestore();
  });

  it('02.3 - should never store plain text password in database', async () => {
    const userService = TestManager.getHandler(UserService);
    const userRepository = TestManager.getRepository(User);

    const plainPassword = 'MySecretPassword123!';
    const username = faker.internet.username();

    const user = await userService.createUser({
      username,
      password: plainPassword,
    });

    const userFromDb = await userRepository.findOne({
      where: { id: user.id },
      select: ['id', 'username', 'password'],
    });

    expect(userFromDb?.password).not.toBe(plainPassword);
    expect(userFromDb?.password).toBeDefined();
  });

  it('02.4 - should use password hashing helper function for all password operations', async () => {
    const userService = TestManager.getHandler(UserService);

    const generateHashPasswordSpy = jest.spyOn(
      passwordHelper,
      'generateHashPassword',
    );

    await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    expect(generateHashPasswordSpy).toHaveBeenCalledTimes(1);

    generateHashPasswordSpy.mockRestore();
  });
});
