# STEMFORCES

This repository contains a React + Node.js (Express + Mongoose) app for quizzes and learning.

Quick start (local with Docker):

1. Copy environment variables:

   - `backend/.env.example` -> `backend/.env`

2. Start with docker-compose:

```bash
docker-compose up --build
```

This starts `mongo`, `backend` (port 5000) and `frontend` (port 3000).

CI: GitHub Actions workflow available at `.github/workflows/ci.yml`.

Production notes:

- Backend serves the built frontend when `NODE_ENV=production`.
- Use PM2 with `backend/ecosystem.config.js` for clustering.
