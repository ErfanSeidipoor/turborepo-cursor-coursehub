---
name: 🚀 Create API Endpoint
about: Create a new API endpoint in an existing NestJS backend application following CQRS patterns
title: 'Create API: [API_NAME] in [APP]/[MODULE]'
labels: ['api', 'nestjs', 'cqrs', 'task:create-api']
assignees: ''
---

## 📋 Task Description

Create a new API endpoint in an existing NestJS backend application following the monorepo conventions, CQRS patterns, and standards defined in `.cursor/rules/@task-create-an-api.mdc`.

## 🔧 Required Inputs

### ✅ Required

- **`<APP>`**: <!-- The name of the existing NestJS application (kebab-case) -->
  - Example: `backend`, `user-service`, `order-management`
  - Must be an existing application under `apps/<APP>`

- **`<MODULE>`**: <!-- The name of the module within the application (kebab-case) -->
  - Example: `user`, `order`, `campaign`, `notification`
  - Will define the API functionality domain

- **`<API_TYPE>`**: <!-- The HTTP method for the API endpoint -->
  - Options: `Post`, `Get`, `Put`, `Delete`, `Patch`
  - Example: `Post` for creation, `Get` for retrieval

- **`<API_NAME>`**: <!-- The name of the API endpoint (kebab-case) -->
  - Example: `create-user`, `get-user`, `update-order`, `list-campaigns`
  - Should clearly indicate the action (command: create/update/delete, query: get/list)

- **`<API_PATH>`**: <!-- The API path following the format: <APP>/<MODULE>/<API_NAME> -->
  - Example: `backend/user/create-user`, `backend/order/get-order`
  - Must use kebab-case and follow the monorepo path convention

### 🔧 Optional Inputs

- **`<REQUEST_BODY>`**: <!-- Description of the request body structure -->
  - Example: "User creation data including email, firstName, lastName"
  - Used for POST/PUT endpoints that accept data in the request body

- **`<REQUEST_QUERY>`**: <!-- Description of the query parameters structure -->
  - Example: "Pagination and filtering parameters: page, limit, status"
  - Used for GET endpoints that accept query parameters

- **`<RESPONSE_BODY>`**: <!-- Description of the response body structure -->
  - Example: "User object with id, email, firstName, lastName, createdAt"
  - Defines the expected output format of the endpoint

**Note**: Please implement the issue following the complete workflow defined in `.cursor/rules/@task-create-an-api.md`, ensuring ALL 14 subtasks are completed in order.

## Implementation Checklist from `.cursor/rules/@task-create-an-api.md`

- [ ] SUBTASK-1: Check requirements
- [ ] SUBTASK-2: Build packages
- [ ] SUBTASK-3: Run database migrations
- [ ] SUBTASK-4: Apply example patterns
- [ ] SUBTASK-5: Create DTOs in @repo/dtos
- [ ] SUBTASK-6: Create DTOs in apps/<APP>/src/modules/<MODULE>/dtos
- [ ] SUBTASK-7: Define Command/Query classes
- [ ] SUBTASK-8: Define Handler classes
- [ ] SUBTASK-9: Define controller
- [ ] SUBTASK-10: Create module
- [ ] SUBTASK-11: Register module in app.module.ts
- [ ] SUBTASK-12: Review code compliance
- [ ] SUBTASK-13: Build all packages
- [ ] SUBTASK-14: Verify application startup

## 🚩 CRITICAL WORKFLOW INSTRUCTIONS

> ⚠️ **Strict adherence to this workflow is essential for successful task completion and project integrity.**  
> Failure to follow these steps may result in delays, rejected work, or integration issues.

- **Always** perform all implementation for this task in a dedicated feature branch (e.g., `feature/create-api-<API_NAME>-<MODULE>`).  
  _If a branch with this name already exists, append an auto-incrementing number to the end of the branch name (e.g., `feature/create-api-<API_NAME>-<MODULE>-2`, `feature/create-api-<API_NAME>-<MODULE>-3`, etc.) to create a new branch.  
  \_This ensures isolation, traceability, and safe collaboration._
- After completing your changes, **stage and commit all modifications** with a clear, descriptive commit message.  
  _Use `git add .` to stage all changes and ensure that no tracked changes are left unstaged or uncommitted before proceeding._  
  _Well-written commit messages help reviewers and future maintainers understand your intent._

- **Before sending the pull request, build all packages and apps** to confirm there are no side effects.  
  _Run the build command for the entire monorepo to ensure all dependencies compile correctly._  
  _If there are any build issues, resolve them before proceeding to maintain project integrity._

- **Push your feature branch to the remote repository** promptly to enable visibility and collaboration.
- **Open a Pull Request (PR) targeting the main branch.**  
  _Your PR must pass all code review and CI checks before it can be merged._  
  _Ensure all changes are included in the PR by confirming that `git add .` was executed before committing._

> 🧠 **Why is this important?**  
> Following this workflow guarantees code quality, enables effective review, and maintains the stability of the main branch. It is a core requirement for all contributors and AI agents working on this repository.

---

## 🚦 Scope Limitation Notice

> ⚠️ **Important:**  
> For this task, **do not perform any actions outside the explicit scope of this issue and the attached Cursor rules** (`@task-create-an-api.mdc`).  
> Only implement, modify, or scaffold files and configurations as directly required by this API endpoint creation task.  
> **Avoid unrelated refactoring, dependency updates, or changes to other modules, applications, or shared packages.**

> 🧭 **Why?**  
> Strict scope adherence ensures focused, reviewable, and maintainable contributions, and upholds the integrity of the monorepo and its conventions.
