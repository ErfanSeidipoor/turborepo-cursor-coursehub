1. SUBTASK-1: Create a new feature branch from main

- Before making any changes, create a new local feature branch from the latest `main` branch.
- Use the following naming convention for the branch:  
  `feature/create-or-update-domain-<DOMAIN>`
- If a branch with this name already exists, append an incrementing number (e.g., `feature/create-or-update-domain-<DOMAIN>`).
- Example commands:
  ```bash
  git checkout main
  git pull
  git checkout -b feature/create-or-update-domain-<DOMAIN>
  ```
- This ensures all work is isolated, traceable, and ready for review before merging into the main branch.
