# Secure DMS

Secure DMS is a hackathon-ready evidence and case-document platform. The API contract in [docs/CONTRACT.md](docs/CONTRACT.md) is the integration source of truth.

## Run locally

Prerequisite: Docker Desktop.

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API and OpenAPI docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432 (`dms_user` / `dms_password`, development only)

The backend applies Alembic migrations before it starts. To reset only the local database volume, run `docker compose down -v` and start the stack again.

## Team workflow

- Use a short-lived `person<N>/<scope>` branch, such as `person3/ai-pipeline`.
- Update `docs/CONTRACT.md` in the same PR as any API/schema shape change.
- Keep commits focused, rebase on `main`, and merge through a pull request.
- Verify the relevant checks and `docker compose up --build` before merging.

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md), [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md), and [docs/PITCH_DECK.md](docs/PITCH_DECK.md).
