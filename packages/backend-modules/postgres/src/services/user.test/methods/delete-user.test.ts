import { CustomError, USER_NOT_FOUND } from '@repo/http-errors';
import { TestManager } from '../../../test-manager.test';
import { UserService } from '../../user.service';
import { faker } from '@faker-js/faker';

describe('UserService - deleteUser', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should soft delete a user when user exists', async () => {
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    await userService.deleteUser({ userId: user.id });

    const deletedUser = await userService.findUserById({
      userId: user.id,
      returnError: false,
    });

    expect(deletedUser).toBeNull();
  });

  it('should throw USER_NOT_FOUND when user does not exist', async () => {
    const userService = TestManager.getHandler(UserService);

    await expect(
      userService.deleteUser({ userId: faker.string.uuid() }),
    ).rejects.toThrow(new CustomError(USER_NOT_FOUND));
  });
});
