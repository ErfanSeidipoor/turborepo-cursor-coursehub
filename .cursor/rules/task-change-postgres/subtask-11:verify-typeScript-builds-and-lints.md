11. SUBTASK-11: Verify TypeScript builds and lints

- Ensure no TypeScript or linter errors due to entity or enum updates:

```bash
# Build affected packages (or the whole workspace if preferred)
pnpm -w --filter @repo/postgres build
pnpm -w --filter @repo/enums build

# Optional: workspace-wide build and lint
pnpm -w build
pnpm -w lint
```
