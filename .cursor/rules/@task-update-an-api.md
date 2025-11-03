---
description: This Cursor rule defines the standards and conventions for updating an existing API inside a defined backend application using the NestJS framework with Swagger documentation.
globs:
alwaysApply: false
---

# task: update an api (@backend.md)

// This rule defines the standards and conventions for updating existing API endpoints in any nestjs projects, ensuring consistency, maintainability, and proper documentation using NestJS.
// This rule is based on and extends the `.cursor/rules/@task-create-an-api.md` rule for creating new APIs.

## Inputs Required to Apply This Rule

To implement this rule, provide the following inputs:

- `<APP>`:(required) The name of the NestJS application.
- `<MODULE>`:(required) The name of the module within the application that contains the API functionality to be updated.
- `<API_TYPE>`:(required) the type of the API Post,Get, Path, Delete Or Put
- `<API_NAME>`:(required) the name of the api consist of command like `create-user` or query 'get-user'
- `<API-PATH>`:(required) The API path must follow this format: `<APP>/<MODULE>/<API_NAME>`.
  - Use kebab-case for the command or query and action (e.g., `create-user`, `get-user`).
  - The path should clearly indicate whether it is a command (for mutations, e.g., `create`, `update`, `delete`) or a query (for retrieval, e.g., `get`, `list`).
  - Example: `backend/user/create-user` or `backend/order/get-order`.
  - This structure ensures consistency and clarity across all API endpoints, as required by Cursor rules.
- `<DESCRIPTION>`:(required) A clear and detailed description of the changes being made to the API. This should explain what is being updated, why the changes are necessary, and any impact on existing functionality. Examples: "Add email validation to user registration", "Update order status enum to include 'cancelled' state", "Modify user profile to include optional phone number field".
- <REQUEST-BODY>:(optional) The shape of the request body expected by the API endpoint, typically defined as a DTO class. Use this input when the endpoint accepts data in the body of the request (e.g., POST, PUT).
- <REQUEST-QUERY>:(optional) The structure of the query parameters accepted by the API endpoint, typically defined as a DTO class. Use this input when the endpoint accepts data via URL query parameters (e.g., GET with filters or pagination).
- <RESPONSE_BODY>:(optional) The structure of the response body returned by the API endpoint, typically defined as a DTO class. Use this input to specify the expected output format of the endpoint.

## Environment Variables

- All environment variables required for database connections, credentials, or configuration **must** be defined in the `.env` file located at the project root directory. If you need to access these environment variables from any subfolder (such as during migration scripts or local development), **copy and paste** the `.env` file into that subfolder to ensure environment variable resolution works as expected. This practice ensures consistency and prevents issues with missing or misconfigured environment variables during migration execution or development tasks.

The following subtasks must be implemented to update API endpoints in compliance with this rule:

## Subtasks for API Endpoint Updates

1. **SUBTASK-1: Check the requirements to implement this task**

- A NestJS application (`<APP>`) and at least one domain module (`<MODULE>`) must be present to update the API. The application and module names should be specified in the task description. All API logic, controllers, and business rules must be encapsulated within the specified module.
- The `<APP>`, `<API-PATH>`, and `<DESCRIPTION>` inputs are mandatory for implementing this task. The `<API_NAME>` is used for naming files and variables, while `<API-PATH>` defines the API route within the controller. The `<DESCRIPTION>` provides context about what changes are being made and why. Ensure all are specified to maintain consistency and clarity in the API structure.
- If any of the required inputs (`<APP>`, `<MODULE>`, `<API_NAME>`, `<API-PATH>`, or `<DESCRIPTION>`) are missing, do not proceed with the task. Prompt the user to provide the missing information before continuing.
- **For updates:** Verify that the existing API files are present before proceeding. If the API doesn't exist, refer to the `.cursor/rules/@task-create-an-api.md` rule instead.

2. **SUBTASK-2: Build All Packages and Applications Before Implementation**

- Before starting the implementation of any API endpoint, ensure that the entire monorepo builds successfully. This step confirms that all packages and applications are in a valid, compilable state and helps catch any pre-existing build errors.
- Run the following command from the root of the repository to build all packages and applications:
  ```
  pnpm run build
  ```
- If you are working in a subfolder or a different environment, ensure the `.env` file is present in the working directory to provide the necessary environment variables for the build process.
- Only proceed with API development after confirming that all builds have completed successfully and without errors.

3. **SUBTASK-3: Run All Database Migrations Before Implementation**

- Before starting the implementation of any API endpoint, ensure that all database migrations are up to date. This guarantees that the database schema reflects the latest changes and prevents inconsistencies between the codebase and the database.
- Use the migration scripts provided in the `packages/postgres` package to apply all pending migrations.
- The recommended command is:
  ```
  pnpm --filter @repo/postgres run migrate:run
  ```
- If you are working in a subfolder or a different environment, ensure the `.env` file is present in the working directory to provide the necessary environment variables for the migration process.
- Only proceed with API development after confirming that all migrations have been successfully applied.

4. **SUBTASK-4: Update or Create Request and Response DTOs in the @repo/dtos Module**

- **Check if this subtask is needed:** Review the `<DESCRIPTION>` to determine if the changes affect request/response data structures. Skip this subtask if the description indicates changes that don't impact DTOs (e.g., "Fix typo in error message", "Update internal logging").
- **Reference:** Follow the same structure and conventions as defined in `.cursor/rules/@task-create-an-api.md` SUBTASK-2.
- **For updates:**
  - Check if DTOs exist in `packages/dtos/src/<APP>/<MODULE>/`
  - Modify existing properties, add new properties, or remove obsolete properties as needed
  - Update the `index.ts` file to include any new DTOs or remove exports for deleted DTOs
- **For new DTOs:** Create following the conventions in `.cursor/rules/@task-create-an-api.md`

5. **SUBTASK-5: Update or Create Request and Response DTOs in the `apps/<APP>/src/modules/<MODULE>/dtos` Module**

- **Check if this subtask is needed:** Review the `<DESCRIPTION>` to determine if the changes affect request/response data structures or Swagger documentation. Skip this subtask if the description indicates changes that don't impact API documentation or DTOs.
- **Reference:** Follow the same structure and conventions as defined in `.cursor/rules/@task-create-an-api.md` SUBTASK-3.
- **For updates:**
  - Check if DTOs exist in `apps/<APP>/src/modules/<MODULE>/dtos`
  - Modify existing properties, add new properties, or remove obsolete properties as needed
  - Update Swagger decorators accordingly
  - Update the `index.ts` file to include any new DTOs or remove exports for deleted DTOs
- **For new DTOs:** Create following the conventions in `.cursor/rules/@task-create-an-api.md`

6. **SUBTASK-6: Update or Create Command or Query Classes for CQRS**

- **Check if this subtask is needed:** Review the `<DESCRIPTION>` to determine if the changes affect the business logic, data processing, or command/query parameters. Skip this subtask if the description indicates changes that only affect presentation layer (e.g., "Update API documentation", "Fix response formatting").
- **Reference:** Follow the same structure and conventions as defined in `.cursor/rules/@task-create-an-api.md` SUBTASK-4.
- **For updates:**
  - Check if command/query classes exist in `apps/<APP>/src/modules/<MODULE>/commands/impl/` or `apps/<APP>/src/modules/<MODULE>/queries/impl/`
  - Modify constructor parameters, add new parameters, or remove obsolete parameters as needed
  - Update the `index.ts` files to include any new classes or remove exports for deleted classes
- **For new classes:** Create following the conventions in `.cursor/rules/@task-create-an-api.md`

7. **SUBTASK-7: Update or Create the Handler Class for CQRS**

- **Check if this subtask is needed:** Review the `<DESCRIPTION>` to determine if the changes affect business logic implementation, data processing, or service interactions. Skip this subtask if the description indicates changes that don't affect the core business logic (e.g., "Update HTTP status codes", "Change API route path").
- **Reference:** Follow the same structure and conventions as defined in `.cursor/rules/@task-create-an-api.md` SUBTASK-5.
- **For updates:**
  - Check if handler classes exist in `apps/<APP>/src/modules/<MODULE>/commands/handlers/` or `apps/<APP>/src/modules/<MODULE>/queries/handlers/`
  - Modify constructor parameters to inject new services or remove obsolete ones
  - Update the `execute` method logic as needed
  - Modify return types if the response structure has changed
  - Update the `index.ts` files to export any new handlers or remove exports for deleted handlers
- **For new handlers:** Create following the conventions in `.cursor/rules/@task-create-an-api.md`

8. **SUBTASK-8: Update the Controller for API**

- **Check if this subtask is needed:** Review the `<DESCRIPTION>` to determine if the changes affect the API endpoint interface, HTTP methods, routing, authentication, or response handling. This subtask is usually needed unless the description indicates purely internal changes that don't affect the API contract.
- **Reference:** Follow the same structure and conventions as defined in `.cursor/rules/@task-create-an-api.md` SUBTASK-6.
- **For updates:**
  - Check if controller exists at `apps/<APP>/src/modules/<MODULE>/{MODULE}.controller.ts`
  - Modify existing API endpoint methods if they exist
  - Add new API endpoint methods if they don't exist
  - Update decorators, parameters, and return types as needed
  - Update Swagger documentation (summary, description, responses) to reflect changes
- **For new endpoints:** Create following the conventions in `.cursor/rules/@task-create-an-api.md`

9. **SUBTASK-9: Update the Module if Required**

- **Check if this subtask is needed:** Review the `<DESCRIPTION>` and previous subtasks to determine if new handlers, services, or dependencies were added/removed. Skip this subtask if no new providers or imports are needed based on the changes made in previous subtasks.
- **Reference:** Follow the same structure and conventions as defined in `.cursor/rules/@task-create-an-api.md` SUBTASK-7.
- **For updates:**
  - Check if module exists at `apps/<APP>/src/modules/<MODULE>/{MODULE}.module.ts`
  - Add new command/query handlers to the providers array if new handlers were created
  - Remove obsolete handlers from the providers array if handlers were deleted
  - Add new imports if new backend modules are required
  - Remove unused imports if they are no longer needed

10. **SUBTASK-10: Verify Module Registration in the Main Application Module**

- **Check if this subtask is needed:** Review the `<DESCRIPTION>` and previous subtasks to determine if the module structure was significantly changed or if new modules were created. Skip this subtask if only existing functionality was updated without structural changes.
- **Reference:** Follow the same structure and conventions as defined in `.cursor/rules/@task-create-an-api.md` SUBTASK-8.
- **For updates:**
  - Verify module is properly imported in `apps/<APP>/src/app.module.ts`
  - Usually no changes are needed unless the module itself was significantly restructured
  - Update import paths if the module location changed
  - Ensure the module is still in the imports array
  - Maintain alphabetical order with other modules in the imports array

11. **SUBTASK-11: Build All Packages and Applications to Verify Integration**

- To ensure that all packages and applications in the monorepo build and integrate correctly, run the following command from the root of your repository: `npm run build`

12. **SUBTASK-12: Verify Application Startup and Routing**

- If you encounter environment variable issues when starting the application, copy and paste the `.env` file from the root directory to `./apps/<APP>/`. This ensures all required environment variables are available during development.
- After copying the `.env` file, start the application in development mode using:
  ```
  pnpm -w --filter <APP> dev
  ```
- This practice helps prevent configuration errors and ensures a smooth development experience.
- Confirm that the global prefix is set to `<APP>`.
- Verify that the application is accessible at:  
  `http://localhost:<PORT>/<APP>`

## Key Differences from Create API Rule

- **File Existence Check:** Always check if files exist before creating new ones
- **Update vs Create:** Modify existing files when possible, create new ones only when necessary
- **Backward Compatibility:** Consider impact on existing functionality when making changes
- **Index File Updates:** Always update index.ts files to reflect new or removed exports
- **Dependency Management:** Update constructor injections and service dependencies as needed
- **Documentation Updates:** Ensure Swagger documentation reflects all changes made to the API

## Migration Considerations

When updating APIs, consider:

- **Breaking Changes:** Document any breaking changes in API contracts
- **Version Compatibility:** Ensure updates don't break existing client integrations
- **Data Migration:** Plan for any database schema changes if needed
- **Testing:** Update or create tests to cover the modified functionality
- **Rollback Strategy:** Have a plan to revert changes if issues arise
