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
- `<API_TYPE>`: post
- `<API_NAME>`: create-product
- `<API-PATH>`: /api/product
- `<REQUEST-BODY>`:
  name
  slug
  description
  type
  isActive
  price

1. **SUBTASK-1: Check the requirements to implement this task**
   PASS

2. **SUBTASK-2: Build All Packages and Applications Before Implementation**
   PASS

3. **SUBTASK-3: Run All Database Migrations Before Implementation**
   PASS

4. **SUBTASK-4: Select and Apply Example Patterns**
   PASS

5. **SUBTASK-5: Create Request and Response DTOs in the @repo/dtos Module**

packages/dtos/src/api/product/create-product.request.dto.ts

```ts
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductTypeEnum } from '@repo/enums';

/**
 * DTO for creating a new product
 * Contains all possible fields from the Product entity
 */
export class CreateProductRequestDto {
  /**
   * Name of the Product
   */
  @IsString({ message: 'name must be a string' })
  @Length(1, 255, { message: 'Name must be between 1 and 255 characters' })
  name: string;

  /**
   * URL-friendly slug for the product
   */
  @IsString({ message: 'Slug must be a string' })
  @Length(1, 255, { message: 'Slug must be between 1 and 255 characters' })
  slug: string;

  /**
   * Detailed description of the product
   */
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  /**
   * Type of product (location or event)
   */
  @IsEnum(ProductTypeEnum, {
    message: 'Type must be a valid ProductTypeEnum value',
  })
  type: ProductTypeEnum;

  /**
   * Indicates if the product is active
   */
  @IsBoolean({ message: 'isActive must be a boolean value' })
  @Type(() => Boolean)
  isActive: boolean;

  @IsOptional()
  @Type(() => Number)
  price?: number;
}
```

packages/dtos/src/api/product/create-product.response.dto.ts

```ts
import { Product } from '@repo/postgres';
export class CreateProductResponseDto {
  product: Product;
}
```

packages/dtos/src/api/product/index.ts

```ts
// Request DTOs
export { CreateProductResponseDto } from './create-product.response.dto';

export { CreateProductRequestDto } from './create-product.request.dto';

// other dtos
```

6. **SUBTASK-6: Create Request and Response DTOs in the `apps/<APP>/src/modules/<MODULE>/dtos` Module**

apps/api/src/modules/product/dtos/create-product.request.dto.ts

```ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductAgeRangeEnum, ProductTypeEnum } from '@repo/enums';

export class CreateProductRequestDtoAPI extends CreateProductRequestDto {
  @ApiProperty({
    description: 'Name of the product',
    example: 'Premium Soccer Ball',
    minLength: 1,
    maxLength: 255,
  })
  declare name: string;

  @ApiProperty({
    description: 'URL-friendly slug for the product',
    example: 'premium-soccer-ball',
    minLength: 1,
    maxLength: 255,
  })
  declare slug: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the product',
    example:
      'A high-quality soccer ball suitable for professional matches and training.',
  })
  declare description?: string;

  @ApiProperty({
    description: 'Type of product (location or event)',
    enum: ProductTypeEnum,
    example: ProductTypeEnum.LOCATION,
  })
  declare type: ProductTypeEnum;

  @ApiProperty({
    description: 'Indicates if the product is active',
    example: true,
  })
  declare isActive: boolean;

  @ApiPropertyOptional({
    description: 'Price of the product',
    example: 29.99,
    format: 'float',
  })
  price?: number;
}
```

apps/api/src/modules/product/dtos/create-product.response.dto.ts

```ts
import { CreateProductResponseDto } from '@repo/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '@repo/postgres';

export class CreateProductResponseDtoAPI extends CreateProductResponseDto {
  @ApiProperty({
    description: 'The created product',
    type: Product,
  })
  declare product: Product;
}
```

apps/api/src/modules/product/dtos/index.ts

```ts
export { CreateProductRequestDtoAPI } from './create-product.request.dto';
export { CreateProductResponseDtoAPI } from './create-product.response.dto';

// other dtos
```

7. **SUBTASK-7: Define Command or Query Classes for CQRS**

apps/api/src/modules/product/commands/impl/create-product.command.ts

```ts
import { CreateProductRequestDto } from '@repo/dtos';

export class CreateProductCommand {
  constructor(
    public readonly createProductRequestDto: CreateProductRequestDto,
  ) {}
}
```

apps/api/src/modules/product/commands/impl/index.ts

```ts
export { CreateProductCommand } from './create-product.command';

// other commands
```

8. **SUBTASK-8: Define the Handler Class for CQRS**

apps/api/src/modules/product/commands/handlers/create-product.handler.ts

```ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProductService } from '@repo/backend-modules-postgres';
import { CreateProductCommand } from '../impl/create-product.command';
import { CreateProductResponseDto } from '@repo/dtos';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand>
{
  constructor(private readonly productService: ProductService) {}

  async execute(
    command: CreateProductCommand,
  ): Promise<CreateProductResponseDto> {
    const { createProductRequestDto } = command;
    const { name, slug, description, type, isActive, price } =
      createProductRequestDto;

    const product = await this.productService.createProduct({
      name,
      slug,
      description,
      type,
      isActive,
      price,
    });

    return { product };
  }
}
```

apps/back/src/modules/product/commands/handlers/index.ts

```ts
import { CreateProductHandler } from './create-product.handler';
// other handlers

export const commandHandlers = [
  CreateProductHandler,
  // other handlers
];
```

9. **SUBTASK-9: Define the controller for API**

apps/api/src/modules/product/product.controller.ts

```ts
import { Controller, Post, Body } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateProductCommand } from './commands/impl';
import {
  CreateProductRequestDtoAPI,
  CreateProductResponseDtoAPI,
} from './dtos';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Create a new product with all the specified details',
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: CreateProductResponseDtoAPI,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data or business rule violation',
  })
  @ApiResponse({
    status: 409,
    description: 'Product with this slug already exists',
  })
  async createProduct(
    @Body() createProductRequestDto: CreateProductRequestDtoAPI,
  ): Promise<CreateProductResponseDtoAPI> {
    return this.commandBus.execute(
      new CreateProductCommand(createProductRequestDto),
    );
  }
}
```

10. **SUBTASK-10: Create the Module if Not Already Present**

apps/api/src/modules/product/product.module.ts

```ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgresModule } from '@repo/backend-modules-postgres';
import { ProductController } from './product.controller';
import { commandHandlers } from './commands/handlers';
import { queryHandlers } from './queries/handlers';

@Module({
  imports: [CqrsModule, PostgresModule],
  controllers: [ProductController],
  providers: [...commandHandlers, ...queryHandlers],
})
export class ProductModule {}
```

11. **SUBTASK-11: Register the Module in the Main Application Module**

apps/api/src/app.module.ts

```ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductModule } from './modules/product/product.module';
import { TagModule } from './modules/tag/tag.module';

@Module({
  imports: [CqrsModule, ProductModule, TagModule],
})
export class AppModule {}
```

12. **SUBTASK-12: Build All Packages and Applications to Verify Integration**

PASS

13. **SUBTASK-13: Verify Application Startup and Routing**

PASS
