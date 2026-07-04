# EventHub 360 ? Quotation & Proposal Management

A full-stack workspace for building quotations, managing pricing catalogs, routing approvals, and producing client proposals for event operations.

## Core capabilities

- Quotation creation, line-item pricing, tax, margin, and status workflows
- Global price books, rate cards, packages, and catalog categories
- Role-aware authentication, permissions, and approval actions
- Proposal generation, previews, client actions, and signatures
- Operational dashboards, reporting, notifications, and system settings

## Technology

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend:** NestJS, Prisma, PostgreSQL, JWT authentication
- **Workspace:** npm workspaces with shared root commands

## Local setup

### Prerequisites

- Node.js 22 or newer
- npm 10 or newer
- PostgreSQL

### Install

```powershell
npm install
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Update `backend/.env` with a valid PostgreSQL connection string and a strong JWT secret.

### Prepare the database

```powershell
Set-Location backend
npx prisma migrate deploy
npx prisma db seed
Set-Location ..
```

### Run locally

Use two terminals from the repository root:

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

- Web application: http://localhost:5173
- API and Swagger UI: http://localhost:3000/api

## Quality checks

```powershell
npm run lint
npm test
npm run build
```

## Repository layout

`frontend/` contains the React application, `backend/` contains the NestJS API and Prisma schema, `backend/prisma/migrations/` contains versioned database migrations, and `docs/` contains implementation and database notes.

## Configuration and security

Environment files, build output, dependencies, runtime uploads, local databases, reports, and source-reference documents are excluded from Git. Commit only the provided `.env.example` templates; never commit real credentials or production secrets.
