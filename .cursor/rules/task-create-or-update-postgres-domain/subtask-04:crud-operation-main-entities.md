4. SUBTASK-4: crud-operation-for-main-entities

- First, check if a service file already exists for each main DOMAIN entity. Service files should be located in:  
  `packages/backend-modules/postgres/src/services`
  The expected file naming pattern is:  
  `packages/backend-modules/postgres/src/services/{entity-kebab-case}.service.ts`  
  For example, for an entity like "Customer", the service file should be:  
  `packages/backend-modules/postgres/src/services/customer.service.ts`

- The reference and canonical guide for how to structure and implement each Postgres service is:
  `packages/backend-modules/postgres/.cursor/rules/@backend-modules-postgres.md`
  Use this file to ensure your service code matches all required conventions, naming, and implementation patterns.

- extract the list of the entities from the <DOMAIN-MAIN-ENTITIES>
- Write Crud operation consist of
  - create
  - delete
  - update
  - get
  - get-by-id

When implementing CRUD operations for main entities in this domain, you must:

- Strictly follow all domain rules and requirements specified in `packages/docs/domains.md`.
- Carefully review each entity file for `TABLE-DESCRIPTION` and `COLUMN-DESCRIPTION` comments to understand field purposes, constraints, and relationships between entities.
- Ensure all logic—including validations and business constraints—aligns with both the central domain documentation and the metadata within the entity definitions.

- example here:

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { EntityName1, EntityName2, EntityName3 } from '@repo/postgres/entities';
import { IPaginate } from '@repo/dtos/pagination';
import { SortEnum } from '@repo/enums'
import { paginate } from './utils/paginate';
import {
    CustomError,
    ENTITY_NAME_NOT_FOUND,
    ENTITY_NAME_NAME_REQUIRED,
    ENTITY_NAME_NAME_EMPTY
} from '@repo/http-errors';

@Injectable()
export class {Domain}Service {
    constructor(
        @InjectRepository(EntityName1)
        private readonly entityName1Repository: Repository<EntityName1>,
        @InjectRepository(EntityName2)
        private readonly entityName2Repository: Repository<EntityName2>,
        // other entities
    ) {}

    public async createEntityName(input: {
        name: string;
        description?: string;
        isActive?: boolean;
    }): Promise<EntityName> {

        const { name, description, isActive} = input

        // validate based on the DOMAIN-RULES

        const entity = this.entityNameRepository.create({
            name,
            description,
            isActive
        });

        const savedEntity = await this.entityNameRepository.save(entity);
        return savedEntity;
    }



    public async findEntityName1ById(input: {
        entityNameId: string,
        returnError?: boolean
        relations?: FindOptionsRelations<EntityName1> | FindOptionsRelationByString;
    }): Promise<EntityName | undefined> {

        const { entityNameId, returnError } = input

        if(!entityNameId && returnError) {
            if(returnError) {
                return throw new CustomError(ENTITY_NAME_NAME_1_NOT_FOUND);
            }
            else {
                return undefinrelationsed
            }
        }

        const entityName = await this.entityNameRepository.findOne({
            where: { id: entityNameId }
            relations,
        });

        if(!entityName && returnError) {
            return throw new CustomError(ENTITY_NAME_NAME_1_NOT_FOUND);
        }

        return entityName;
    }

    public async updateEntityName(input: {
        entityNameId: string;
        name?: string;
        description?: string;
        isActive?: boolean;
    }): Promise<EntityName> {

        const { entityNameId, name, description, isActive} = input

        const entityName = await this.findEntityName1ById({
            entityNameId,
            returnError: true
        });

        // validate based on the DOMAIN-RULES

        updateValue = {}

        if(name && name !== entityName.name) {
            updateValue.name = name
        }

        if(description && entity.description !== entityName.description) {
           updateValue.description = description
        }

        if(isActive !== undefined &&  isActive !== entityName.isActive) {
            updateValue.isActive = isActive
        }

        await this.entityNameRepository.update({ id: entityNameId }, updateValue)

        return await this.findEntityName1ById({
            entityNameId,
            returnError: true
        });
    }

    public async deleteEntityName(input: {entityNameId: string}): Promise<void> {
        const { entityNameId } = input

        const entityName = await this.findEntityName1ById({
            entityNameId,
            returnError: true
        });

        // validate delete entity on the DOMAIN-RULES

        await entityName.softRemove()
    }

    public async findEntityNames(options: {
        page?: number;
        limit?: number;
        isActive?: boolean;
        searchTerm?: string;
        sort?: string;
        sortType?: SortEnum
    } = {}): Promise<IPaginate<EntityName>> {
        const { page, limit, isActive, searchTerm, sort, sortType } = options;

        const queryBuilder = this.entityNameRepository
            .createQueryBuilder('entityName')
            // add other relations if needed

        if (isActive !== undefined) {
            queryBuilder.andWhere('entityName.isActive = :isActive', { isActive });
        }

        if (searchTerm) {
            queryBuilder.andWhere('(entityName.name ILIKE :searchTerm OR entityName.description ILIKE :searchTerm)' , {
                searchTerm: `%${searchTerm}%`
            });
        }

        if (sort, sortType) {
            queryBuilder.orderBy(sort, sortType );
        }


        return await paginate(queryBuilder, limit, page);
    }

    // For each main entity in this domain, implement CRUD operations (create, read, update, delete) as shown above.
    // Additionally, ensure you handle the relationships between these entities according to the specifications in `packages/docs/domains.md`.
    // Review and respect all domain rules, table descriptions, and field constraints defined for each entity.
    // Implement any necessary validation, error handling, and business logic as required by the domain documentation.
}
```
