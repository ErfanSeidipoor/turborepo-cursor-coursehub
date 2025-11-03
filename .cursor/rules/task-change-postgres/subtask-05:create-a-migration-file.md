5. SUBTASK-05: Create a migration file

- Create a descriptive migration using the workspace scripts (ref. @postgres.mdc Migration Commands Reference).

```bash
# From packages/postgres directory
pnpm migration:create --name=<migration-title>
# choose a short title for migration file
```

- Use a name that clearly reflects the change, e.g., `add-status-to-orders`.
