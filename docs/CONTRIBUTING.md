# Team integration workflow

## Branches and ownership

- `main` is demo-ready only. Merge through a pull request; do not force-push it.
- Use `person<N>/<scope>` branches. Keep changes within your owned area where possible.
- `CONTRACT.md` is shared ownership. Update it with any API or schema change.

## Pull-request checklist

- Rebase on current `main` and resolve conflicts locally.
- Confirm field names, UUID formats, enum values, and error status codes match `CONTRACT.md`.
- For API changes, verify `/docs` and include a request/response example in the PR.
- For UI changes, verify loading, failure, and expired-access states.
- Ensure the Compose stack still starts and the relevant checks pass.

## Integration checkpoints

1. Hour 0: lock schema/API map.
2. Day 1 midday: frontend changes from mocks to live endpoints.
3. Day 1 end: login, upload, and list work end-to-end.
4. Day 2 midday: AI and audit data flow through the main app.
5. Day 2 evening: feature freeze; demo-blocking fixes only.
