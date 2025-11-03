---
name: 🏗️ Create Backend Application
about: Create a new NestJS backend application following monorepo conventions
title: 'Create Backend Application: [APP_NAME]'
labels: ['backend', 'nestjs', 'task:create-backend-application']
assignees: ''
---

## 📋 Task Description

Create a new NestJS backend application following the monorepo conventions and standards defined in `.cursor/rules/@task-create-a-backend-application.mdc`.

## 🔧 Required Inputs

### ✅ Required

- **`<APP>`**: <!-- The name of the backend application (kebab-case) -->
  - Example: `user-service`, `order-management`, `notification-api`
  - This will be used as the app directory under `apps/<APP>` and as the global prefix

### 🔧 Optional Inputs

- **`<DESCRIPTION>`**: <!-- Human-readable description for Swagger docs -->
  - Example: "User management and authentication API"
  - Default: "The API description"

- **`<PORT>`**: <!-- Port to run the application -->
  - Example: `4001`, `4002`, `3001`
  - Default: `process.env.PORT || 4000` (increment for additional backend apps)

- **`<ENABLE_SWAGGER>`**: <!-- Whether to configure Swagger -->
  - Options: `true` or `false`
  - Default: `true`

**Note**: This task follows the `@task-create-a-backend-application.mdc` cursor rule. Please ensure all implementation details comply with the defined standards and conventions.

## 🚩 CRITICAL WORKFLOW INSTRUCTIONS

> ⚠️ **Strict adherence to this workflow is essential for successful task completion and project integrity.**  
> Failure to follow these steps may result in delays, rejected work, or integration issues.

- **Always** perform all implementation for this task in a dedicated feature branch (e.g., `feature/create-backend-application-<APP>`).  
  _If a branch with this name already exists, append an auto-incrementing number to the end of the branch name (e.g., `feature/create-backend-application-<APP>-2`, `feature/create-backend-application-<APP>-3`, etc.) to create a new branch._  
  _This ensures isolation, traceability, and safe collaboration._
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
> For this task, **do not perform any actions outside the explicit scope of this issue and the attached Cursor rules** (`@task-create-a-backend-application.mdc`).  
> Only implement, modify, or scaffold files and configurations as directly required by this backend application creation task.  
> **Avoid unrelated refactoring, dependency updates, or changes to other modules, applications, or shared packages.**

> 🧭 **Why?**  
> Strict scope adherence ensures focused, reviewable, and maintainable contributions, and upholds the integrity of the monorepo and its conventions.

---
