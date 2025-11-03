---
description: This Cursor rule demonstrates a clear and standardized approach for implementing a NestJS API endpoint that retrieves a single object (entity) by its unique identifier. This example follows the conventions and steps outlined in the Cursor rule located at `.cursor/rules/@task-create-an-api.md`.

Note: This is provided as a reference example only.
globs:
alwaysApply: false
---

## Inputs Required to Apply This Rule

- `<APP>`: api
- `<MODULE>`: book
- `<API_TYPE>`: get
- `<API_NAME>`: get-book-by-id
- `<API-PATH>`: /api/book/:bookId

1. **SUBTASK-1: Check the requirements to implement this task**
   PASS

2. **SUBTASK-2: Build All Packages and Applications Before Implementation**
   PASS

3. **SUBTASK-3: Run All Database Migrations Before Implementation**
   PASS

4. **SUBTASK-4: Select and Apply Example Patterns**
   PASS

5. **SUBTASK-5: Create Request and Response DTOs in the @repo/dtos Module**

packages/dtos/src/back/book/get-book-by-id.response.dto.ts

```ts
import { Book } from '@repo/postgres';

/**
 * DTO for get book by ID response
 */
export class GetBookByIdResponseDto {
  book: Book;
}
```

packages/dtos/src/api/book/index.ts

```ts
export { GetBookByIdResponseDto } from './get-book-by-id.response.dto';
// other dtos
```

6. **SUBTASK-6: Create Request and Response DTOs in the `apps/<APP>/src/modules/<MODULE>/dtos` Module**

apps/api/src/modules/book/dtos/get-book-by-id.response.dto.ts

```ts
import { GetBookByIdResponseDto } from '@repo/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { Book } from '@repo/postgres';

export class GetBookByIdResponseDtoAPI extends GetBookByIdResponseDto {
  @ApiProperty({
    description: 'Book details',
    type: () => Book,
  })
  declare book: Book;
}
```

apps/api/src/modules/book/dtos/index.ts

```ts
export { GetBookByIdResponseDtoAPI } from './get-book-by-id.response.dto';
// other dtos
```

7. **SUBTASK-7: Define Command or Query Classes for CQRS**

apps/api/src/modules/book/queries/impl/get-book-by-id.query.ts

```ts
export class GetBookByIdQuery {
  constructor(public readonly bookId: string) {}
}
```

apps/api/src/modules/book/queries/impl/index.ts

```ts
export { GetBookByIdQuery } from './get-book-by-id.query';
// other queries
```

8. **SUBTASK-8: Define the Handler Class for CQRS**

apps/api/src/modules/book/queries/handlers/get-book-by-id.handler.ts

```ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBookByIdQuery } from '../impl/get-book-by-id.query';
import { GetBookByIdResponseDto } from '@repo/dtos';
import { BookService } from '@repo/backend-modules-postgres';

@QueryHandler(GetBookByIdQuery)
export class GetBookByIdHandler implements IQueryHandler<GetBookByIdQuery> {
  constructor(private readonly bookService: BookService) {}

  async execute(query: GetBookByIdQuery): Promise<GetBookByIdResponseDto> {
    const { bookId } = query;

    const book = await this.bookService.findBookByBookId(bookId);

    return {
      book,
    };
  }
}
```

apps/api/src/modules/book/queries/handlers/index.ts

```ts
export * from './get-book-by-id.handler';
import { GetBookByIdHandler } from './get-book-by-id.handler';

export const queryHandlers = [
  GetBookByIdHandler,
  // other handlers
];

// other handlers
```

9. **SUBTASK-9: Define the controller for API**

apps/api/src/modules/book/book.controller.ts

```ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GetBookByIdQuery } from './queries/impl';
import { GetBookByIdResponseDtoAPI } from './dtos';

@ApiTags('book')
@Controller('book')
export class BookController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':bookId')
  @ApiOperation({
    summary: 'Get book by ID',
    description: 'Retrieve a single book by its unique identifier',
  })
  @ApiParam({
    name: 'bookId',
    description: 'Book unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Book retrieved successfully',
    type: GetBookByIdResponseDtoAPI,
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  async getBookById(
    @Param('bookId', new ParseUUIDPipe({ version: '4' })) bookId: string,
  ): Promise<GetBookByIdResponseDtoAPI> {
    return this.queryBus.execute(new GetBookByIdQuery(bookId));
  }

  // other routes
}
```

10. **SUBTASK-10: Create the Module if Not Already Present**

apps/api/src/modules/book/book.module.ts

```ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgresModule } from '@repo/backend-modules-postgres';
import { JwtModule } from '@repo/backend-modules-jwt';
import { BookController } from './book.controller';
import { queryHandlers } from './queries/handlers';

@Module({
  imports: [CqrsModule, PostgresModule],
  controllers: [BookController],
  providers: [...queryHandlers],
})
export class BookModule {}
```

11. **SUBTASK-11: Register the Module in the Main Application Module**

apps/api/src/app.module.ts

```ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BookModule } from './modules/book/book.module';

@Module({
  imports: [CqrsModule, BookModule, JwtModule],
})
export class AppModule {}
```

12. **SUBTASK-12: Build All Packages and Applications to Verify Integration**

PASS

13. **SUBTASK-13: Verify Application Startup and Routing**

PASS
