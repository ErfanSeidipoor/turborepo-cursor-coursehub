import { BaseEntity } from './base.entity';
import { Instructor } from './instructor.entity';
import { User } from './user.entity';

export const entities = [BaseEntity, User, Instructor];

export { BaseEntity, User, Instructor };
