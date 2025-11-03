---
description: This Cursor rule demonstrates a clear and standardized approach for implementing an API endpoint in a NestJS backend application that retrieves a list of objects (entities).

This example follows the conventions and steps outlined in the Cursor rule located at `.cursor/rules/@task-create-an-api.md`.

Note: This is provided as a reference example only.
globs:
alwaysApply: false
---

## Inputs Required to Apply This Rule

- `<APP>`: api
- `<MODULE>`: product
- `<API_TYPE>`: get
- `<API_NAME>`: get-products
- `<API-PATH>`: /api/product
- <REQUEST-QUERY>:

```
filter based on these fields:
  - search
  - startCreatedAt
  - endCreatedAt
  - type
  - slug
  - isActive

sort:
  - sortType
  - sort: [createdAt,name]
```

1. **SUBTASK-1: Check the requirements to implement this task**
   PASS

2. **SUBTASK-2: Build All Packages and Applications Before Implementation**
   PASS

3. **SUBTASK-3: Run All Database Migrations Before Implementation**
   PASS

4. **SUBTASK-4: Select and Apply Example Patterns**
   PASS

5. **SUBTASK-5: Create Request and Response DTOs in the @repo/dtos Module**

packages/dtos/src/api/product/get-products.request.dto.ts

```ts
import { IsOptional, IsString, IsDateString, IsBoolean, IsEnum, IsArray, IsPositive, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductTypeEnum, SortEnum } from '@repo/enums';

export enum GetProductsRequestSortEnum {
  createdAt = 'product.createdAt',
  name = 'product.title',
}

export class GetProductsRequestDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date string' })
  startCreatedAt?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date string' })
  endCreatedAt?: string;

  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  slug?: string;


  @IsOptional()
  @IsBoolean({ message: 'isIndoor must be a boolean value' })
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsEnum(ProductTypeEnum, { message: 'Type must be a valid ProductTypeEnum value' })
  type?: ProductTypeEnum;

  @IsOptional()
  @IsPositive({ message: 'Page must be a positive number' })
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsPositive({ message: 'Limit must be a positive number' })
  @Max(30, { message: 'Limit cannot exceed 30' })
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsEnum(SortEnum, { message: 'Sort type must be a valid SortEnum value' })
  sortType?: SortEnum = SortEnum.DESC;

  @IsOptional()
  @IsEnum(GetProductsRequestSortEnum, { message: 'Sort field must be a valid GetProductsRequestSortEnum value' })
  sort?: GetProductsRequestSortEnum = GetProductsRequestSortEnum.createdAt;

```

packages/dtos/src/api/product/get-products.response.dto.ts

```ts
import { Product } from '@repo/postgres';
import { IPaginate, IMeta } from '../../pagination';

export class GetProductsResponseDto implements IPaginate<{ product: Product }> {
  items: { product: Product }[];
  meta?: IMeta;
}
```

packages/dtos/src/api/product/index.ts

```ts
// Request DTOs
export {
  GetProductsRequestDto,
  GetProductsRequestSortEnum,
} from './get-products.request.dto';

// Response DTOs
export { GetProductsResponseDto } from './get-products.response.dto';

// other dtos
```

6. **SUBTASK-6: Create Request and Response DTOs in the `apps/<APP>/src/modules/<MODULE>/dtos` Module**

apps/api/src/modules/product/dtos/get-products.request.dto.ts

```ts
import { GetProductsRequestDto, GetProductsRequestSortEnum } from '@repo/dtos';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductTypeEnum, SortEnum } from '@repo/enums';

export class GetProductsRequestDtoAPI extends GetProductsRequestDto {
  @ApiPropertyOptional({
    description: 'Filter products by title (case-insensitive partial match)',
    example: 'Swimming',
  })
  declare name?: string;

  @ApiPropertyOptional({
    description: 'Filter products with createdAt start date after this date',
    example: '2024-01-01T00:00:00.000Z',
  })
  declare startCreatedAt?: string;

  @ApiPropertyOptional({
    description: 'Filter products with createdAt end date before this date',
    example: '2024-12-31T23:59:59.999Z',
  })
  declare endCreatedAt?: string;

  @ApiPropertyOptional({
    description: 'Filter products by exact slug match',
    example: 'swimming-pool-downtown',
  })
  declare slug?: string;

  @ApiPropertyOptional({
    description: 'Filter products by activation',
    example: true,
  })
  declare isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter products by type',
    enum: ProductTypeEnum,
    example: ProductTypeEnum.PHYSICAL,
  })
  type?: ProductTypeEnum;

  @ApiPropertyOptional({
    description: 'Page number for pagination (1-based)',
    example: 1,
    minimum: 1,
  })
  declare page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 30,
  })
  declare limit?: number;

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: SortEnum,
    example: SortEnum.DESC,
  })
  declare sortType?: SortEnum;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: GetProductsRequestSortEnum,
    example: GetProductsRequestSortEnum.createdAt,
  })
  declare sort?: GetProductsRequestSortEnum;
}
```

apps/api/src/modules/product/dtos/get-products.response.dto.ts

```ts
import { GetProductsResponseDto } from '@repo/dtos';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from '@repo/postgres';

export class GetProductsResponseDtoAPI extends GetProductsResponseDto {
  @ApiProperty({
    description: 'Array of product items',
  })
  declare items: { product: Product }[];

  @ApiPropertyOptional({
    description: 'Pagination metadata',
    example: {
      totalItems: 100,
      itemCount: 10,
      itemsPerPage: 10,
      totalPages: 10,
      currentPage: 1,
    },
  })
  declare meta?: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
```

apps/api/src/modules/product/dtos/index.ts

```ts
export { GetProductsRequestDtoAPI } from './get-products.request.dto';
export { GetProductsResponseDtoAPI } from './get-products.response.dto';
```

7. **SUBTASK-7: Define Command or Query Classes for CQRS**

apps/api/src/modules/product/queries/impl/get-products.query.ts

```ts
import { GetProductsRequestDto } from '@repo/dtos';

export class GetProductsQuery {
  constructor(public readonly getProductsRequestDto: GetProductsRequestDto) {}
}
```

apps/api/src/modules/product/queries/impl/index.ts

```ts
export { GetProductsQuery } from './get-products.query';
// other queries
```

8. **SUBTASK-8: Define the Handler Class for CQRS**

apps/api/src/modules/product/queries/handlers/get-products.handler.ts

```ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductsQuery } from '../impl/get-products.query';
import { GetProductsResponseDto } from '@repo/dtos';
import { ProductService } from '@repo/backend-modules-postgres';

@QueryHandler(GetProductsQuery)
export class GetProductsHandler implements IQueryHandler<GetProductsQuery> {
  constructor(private readonly productService: ProductService) {}

  async execute(query: GetProductsQuery): Promise<GetProductsResponseDto> {
    const { getProductsRequestDto } = query;
    const {
      title,
      startDate,
      endDate,
      slug,
      ageRanges,
      isIndoor,
      type,
      page,
      limit,
      sort,
      sortType,
    } = getProductsRequestDto;

    const result = await this.productService.findProducts({
      title,
      startDate,
      endDate,
      slug,
      ageRanges,
      isIndoor,
      type,
      page,
      limit,
      sort,
      sortType,
    });

    const output: GetProductsResponseDto = {
      items: [],
      meta: result.meta,
    };

    for (const item of result.items) {
      output.items.push({
        product: item,
      });
    }

    return output;
  }
}
```

apps/api/src/modules/product/queries/handlers/index.ts

```ts
export * from './get-products.handler';

import { GetProductsHandler } from './get-products.handler';

export const queryHandlers = [GetProductsHandler];

// other handlers
```

9. **SUBTASK-9: Define the controller for API**

apps/api/src/modules/product/product.controller.ts

```ts
import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetProductQuery } from './queries/impl';
import { GetProductRequestDtoAPI, GetProductResponseDtoAPI } from './dtos';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({
    summary: 'Get products with filtering and pagination',
    description:
      'Retrieve a paginated list of products with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: GetProductResponseDtoAPI,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  async getProduct(
    @Query() getProductRequestDto: GetProductRequestDtoAPI,
  ): Promise<GetProductResponseDtoAPI> {
    return this.queryBus.execute(new GetProductQuery(getProductRequestDto));
  }
}
```

10. **SUBTASK-10: Create the Module if Not Already Present**

apps/api/src/modules/product/product.module.ts

```ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgresModule } from '@repo/backend-modules-postgres';
import { JwtModule } from '@repo/backend-modules-jwt';
import { ProductController } from './product.controller';
import { queryHandlers } from './queries/handlers';

@Module({
  imports: [CqrsModule, PostgresModule],
  controllers: [ProductController],
  providers: [...queryHandlers],
})
export class ProductModule {}
```

11. **SUBTASK-11: Register the Module in the Main Application Module**

apps/api/src/app.module.ts

```ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductModule } from './modules/product/product.module';

@Module({
  imports: [CqrsModule, ProductModule, JwtModule],
})
export class AppModule {}
```

12. **SUBTASK-12: Build All Packages and Applications to Verify Integration**

PASS

13. **SUBTASK-13: Verify Application Startup and Routing**

PASS
