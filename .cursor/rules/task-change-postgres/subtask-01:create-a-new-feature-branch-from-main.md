1. SUBTASK-01: Create a new feature branch from main

- Before making any changes, create a new local feature branch from the latest `main` branch.
- Use the following naming convention for the branch:  
  `feature/db-change-<short-migration-name>`  
  (Replace `<short-migration-name>` with a concise, descriptive name for the migration, e.g., `add-status-to-orders`.)
- If a branch with this name already exists, append an incrementing number (e.g., `feature/db-change-<short-migration-name>-2`).
- Example commands:
  ```bash
  git checkout main
  git pull
  git checkout -b feature/db-change-<short-migration-name>
  ```
- This ensures all work is isolated, traceable, and ready for review before merging into the main branch.
