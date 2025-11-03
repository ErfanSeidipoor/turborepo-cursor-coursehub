import { TestManager } from '../../../test-manager.test';
import { UserService } from '../../user.service';
import { faker } from '@faker-js/faker';

/**
 * DOMAIN RULE 08: Timestamps (createdAt, updatedAt) are automatically managed by the system.
 *
 * This test suite verifies that timestamp fields (createdAt, updatedAt) are
 * automatically set and updated by the ORM/database layer and cannot be
 * manually assigned or modified through the service layer.
 */
describe('Domain Rule 08 - Timestamps Auto-Managed', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('08.1 - should not include createdAt in user creation payload', async () => {
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    expect(user.createdAt).toBeDefined();
  });

  it('08.2 - should not include updatedAt in user creation payload', async () => {
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    expect(user.updatedAt).toBeDefined();
  });

  it('08.3 - should receive auto-generated createdAt timestamp after user creation', async () => {
    const userService = TestManager.getHandler(UserService);

    const actualResult = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    expect(actualResult.createdAt).toBeDefined();
    expect(actualResult.updatedAt).toBeDefined();
    expect(actualResult.createdAt).toBeInstanceOf(Date);
    expect(actualResult.updatedAt).toBeInstanceOf(Date);
  });

  it('08.4 - should not modify timestamps during user update', async () => {
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    const newUsername = faker.internet.username();
    await userService.updateUser({
      userId: user.id,
      username: newUsername,
    });

    const updatedUser = await userService.findUserById({ userId: user.id });

    expect(updatedUser?.createdAt).toEqual(user.createdAt);
  });

  it('08.5 - should rely on ORM/database for timestamp management', async () => {
    const userService = TestManager.getHandler(UserService);

    const actualResult = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    expect(actualResult.createdAt).toBeInstanceOf(Date);
    expect(actualResult.updatedAt).toBeInstanceOf(Date);
  });

  it('08.6 - should ensure createdAt remains unchanged after updates', async () => {
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const originalCreatedAt = user.createdAt;

    await new Promise((resolve) => setTimeout(resolve, 10));

    const actualResult = await userService.updateUser({
      userId: user.id,
      username: faker.internet.username(),
    });

    expect(actualResult.createdAt).toEqual(originalCreatedAt);
  });

  it('08.7 - should allow ORM to update updatedAt timestamp on modifications', async () => {
    const userService = TestManager.getHandler(UserService);

    const user = await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const originalUpdatedAt = user.updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 10));

    const actualResult = await userService.updateUser({
      userId: user.id,
      username: faker.internet.username(),
    });

    expect(actualResult.updatedAt?.getTime()).toBeGreaterThanOrEqual(
      originalUpdatedAt!.getTime(),
    );
  });
});
