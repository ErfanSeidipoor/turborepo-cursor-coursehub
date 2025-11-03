import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsRelations } from 'typeorm';
import { User } from '@repo/postgres/entities/user.entity';
import { IPaginate } from '@repo/dtos/pagination';
import { SortEnum } from '@repo/enums';
import { generateHashPassword } from '@repo/back-share/helpers/password';
import { paginate } from './utils/paginate';
import {
  CustomError,
  USER_NOT_FOUND,
  USER_USERNAME_ALREADY_EXISTS,
  USER_USERNAME_REQUIRED,
  USER_PASSWORD_REQUIRED,
  USER_USERNAME_EMPTY,
  USER_PASSWORD_EMPTY,
} from '@repo/http-errors';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async createUser(input: {
    username: string;
    password: string;
  }): Promise<User> {
    const { username, password } = input;

    if (!username) {
      throw new CustomError(USER_USERNAME_REQUIRED);
    }

    if (!password) {
      throw new CustomError(USER_PASSWORD_REQUIRED);
    }

    if (username.trim().length === 0) {
      throw new CustomError(USER_USERNAME_EMPTY);
    }

    if (password.trim().length === 0) {
      throw new CustomError(USER_PASSWORD_EMPTY);
    }

    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new CustomError(USER_USERNAME_ALREADY_EXISTS);
    }

    const hashedPassword = await generateHashPassword(password);

    const user = this.userRepository.create({
      username: username.trim(),
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    return savedUser;
  }

  public async findUserById(input: {
    userId: string;
    returnError?: boolean;
    relations?: FindOptionsRelations<User>;
  }): Promise<User | undefined> {
    const { userId, returnError, relations } = input;

    if (!userId) {
      if (returnError) {
        throw new CustomError(USER_NOT_FOUND);
      } else {
        return undefined;
      }
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations,
    });

    if (!user && returnError) {
      throw new CustomError(USER_NOT_FOUND);
    }

    return user;
  }

  public async findUserByUsername(input: {
    username: string;
    returnError?: boolean;
    includePassword?: boolean;
  }): Promise<User | undefined> {
    const { username, returnError, includePassword } = input;

    if (!username) {
      if (returnError) {
        throw new CustomError(USER_NOT_FOUND);
      } else {
        return undefined;
      }
    }

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username });

    if (includePassword) {
      queryBuilder.addSelect('user.password');
    }

    const user = await queryBuilder.getOne();

    if (!user && returnError) {
      throw new CustomError(USER_NOT_FOUND);
    }

    return user;
  }

  public async updateUser(input: {
    userId: string;
    username?: string;
    password?: string;
  }): Promise<User> {
    const { userId, username, password } = input;

    const user = await this.findUserById({
      userId,
      returnError: true,
    });

    const updateValue: Partial<User> = {};

    if (username !== undefined && username !== user?.username) {
      if (username.trim().length === 0) {
        throw new CustomError(USER_USERNAME_EMPTY);
      }

      const existingUser = await this.userRepository.findOne({
        where: { username },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new CustomError(USER_USERNAME_ALREADY_EXISTS);
      }

      updateValue.username = username.trim();
    }

    if (password !== undefined) {
      if (password.trim().length === 0) {
        throw new CustomError(USER_PASSWORD_EMPTY);
      }

      updateValue.password = await generateHashPassword(password);
    }

    if (Object.keys(updateValue).length > 0) {
      await this.userRepository.update({ id: userId }, updateValue);
    }

    return (await this.findUserById({
      userId,
      returnError: true,
    })) as User;
  }

  public async deleteUser(input: { userId: string }): Promise<void> {
    const { userId } = input;

    const user = await this.findUserById({
      userId,
      returnError: true,
    });

    if (!user) {
      throw new CustomError(USER_NOT_FOUND);
    }

    await user.softRemove();
  }

  public async findUsers(
    options: {
      page?: number;
      limit?: number;
      searchTerm?: string;
      sort?: string;
      sortType?: SortEnum;
    } = {},
  ): Promise<IPaginate<User>> {
    const { page, limit, searchTerm, sort, sortType } = options;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (searchTerm) {
      queryBuilder.andWhere('user.username ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    if (sort && sortType) {
      queryBuilder.orderBy(`user.${sort}`, sortType);
    } else {
      queryBuilder.orderBy('user.createdAt', SortEnum.DESC);
    }

    return await paginate(queryBuilder, limit, page);
  }

  public async getUserByUsernameWithPassword(input: {
    username: string;
    returnError?: boolean;
  }): Promise<User | undefined> {
    const { username, returnError } = input;

    if (!username) {
      if (returnError) {
        throw new CustomError(USER_USERNAME_REQUIRED);
      } else {
        return undefined;
      }
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();

    if (!user && returnError) {
      throw new CustomError(USER_NOT_FOUND);
    }

    return user || undefined;
  }
}
