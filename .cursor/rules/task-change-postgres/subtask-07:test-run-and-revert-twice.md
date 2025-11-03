7. SUBTASK-07: Test run and revert twice

- From `packages/postgres`, run migrations and then revert, twice, to confirm reversibility and idempotency (ref. @postgres.mdc):

```bash
# 1st cycle
npm run migration:run
npm run migration:revert

# 2nd cycle
npm run migration:run
npm run migration:revert
```
