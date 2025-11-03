---
name: 📋 General Task
about: Create a general development task following monorepo standards and conventions
title: 'Task: [TASK_TITLE]'
labels: ['task', 'general']
assignees: ''
---

## 📋 Task Description

Complete a development task following the monorepo conventions and standards defined in the relevant Cursor rules.

## 🔧 Required Inputs

### ✅ Required

- **`<TASK_DESCRIPTION>`**: <!-- Clear and detailed description of the task -->
  **Must include all of the following details:**
  - **Objective:** What needs to be accomplished
  - **Scope:** Which files, modules, or components will be affected
  - **Requirements:** Specific functionality, behavior, or constraints
  - **Acceptance Criteria:** How to verify the task is complete
  - **Dependencies:** Any related tasks, packages, or external requirements

**Note**: Please ensure all implementation details comply with the defined standards and conventions in the relevant Cursor rules for your specific task type.

## 🚩 CRITICAL WORKFLOW INSTRUCTIONS

> ⚠️ **Strict adherence to this workflow is essential for successful task completion and project integrity.**  
> Failure to follow these steps may result in delays, rejected work, or integration issues.

- **Always** perform all implementation for this task in a dedicated feature branch (e.g., `feature/task-<descriptive-name>`).  
  _If a branch with this name already exists, append an auto-incrementing number to the end of the branch name (e.g., `feature/task-<descriptive-name>-2`, `feature/task-<descriptive-name>-3`, etc.) to create a new branch.  
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
> For this task, **do not perform any actions outside the explicit scope of this issue and the relevant Cursor rules**.  
> Only implement, modify, or scaffold files and configurations as directly required by this specific task.  
> **Avoid unrelated refactoring, dependency updates, or changes to other modules, applications, or shared packages.**

> 🧭 **Why?**  
> Strict scope adherence ensures focused, reviewable, and maintainable contributions, and upholds the integrity of the monorepo and its conventions.
