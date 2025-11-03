import { SortEnum } from '@repo/enums';
import { TestManager } from '../../../test-manager.test';
import { UserService } from '../../user.service';
import { faker } from '@faker-js/faker';

describe('UserService - findUsers', () => {
  beforeAll(async () => {
    await TestManager.beforeAll();
  });

  afterAll(async () => {
    await TestManager.afterAll();
  });

  beforeEach(async () => {
    await TestManager.beforeEach();
  });

  it('should return paginated users with default options', async () => {
    const userService = TestManager.getHandler(UserService);

    await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    await userService.createUser({
      username: faker.internet.username(),
      password: faker.internet.password(),
    });

    const actualResult = await userService.findUsers();

    expect(actualResult.items.length).toBe(2);
    expect(actualResult.meta?.totalItems).toBe(2);
  });

  it('should filter users by search term', async () => {
    const userService = TestManager.getHandler(UserService);

    await userService.createUser({
      username: 'testuser123',
      password: faker.internet.password(),
    });

    await userService.createUser({
      username: 'anotheruser',
      password: faker.internet.password(),
    });

    const actualResult = await userService.findUsers({
      searchTerm: 'test',
    });

    expect(actualResult.items.length).toBe(1);
    expect(actualResult.items[0]?.username).toBe('testuser123');
  });

  it('should sort users by custom field and sort type', async () => {
    const userService = TestManager.getHandler(UserService);

    await userService.createUser({
      username: 'bob',
      password: faker.internet.password(),
    });

    await userService.createUser({
      username: 'alice',
      password: faker.internet.password(),
    });

    const actualResult = await userService.findUsers({
      sort: 'username',
      sortType: SortEnum.ASC,
    });

    expect(actualResult.items[0]?.username).toBe('alice');
    expect(actualResult.items[1]?.username).toBe('bob');
  });

  it('should paginate results with custom page and limit', async () => {
    const userService = TestManager.getHandler(UserService);

    for (let i = 0; i < 10; i++) {
      await userService.createUser({
        username: `user${i}`,
        password: faker.internet.password(),
      });
    }

    const actualResult = await userService.findUsers({
      page: 2,
      limit: 5,
    });

    expect(actualResult.items.length).toBe(5);
    expect(actualResult.meta?.currentPage).toBe(2);
    expect(actualResult.meta?.itemsPerPage).toBe(5);
    expect(actualResult.meta?.totalItems).toBe(10);
  });

  it('should combine search, sort, and pagination', async () => {
    const userService = TestManager.getHandler(UserService);

    await userService.createUser({
      username: 'admin1',
      password: faker.internet.password(),
    });

    await userService.createUser({
      username: 'admin2',
      password: faker.internet.password(),
    });

    await userService.createUser({
      username: 'user1',
      password: faker.internet.password(),
    });

    const actualResult = await userService.findUsers({
      page: 1,
      limit: 10,
      searchTerm: 'admin',
      sort: 'username',
      sortType: SortEnum.DESC,
    });

    expect(actualResult.items.length).toBe(2);
    expect(actualResult.items[0]?.username).toBe('admin2');
    expect(actualResult.items[1]?.username).toBe('admin1');
  });
});
