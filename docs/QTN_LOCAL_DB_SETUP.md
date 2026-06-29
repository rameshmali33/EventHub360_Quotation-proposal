# QTN Module Local PostgreSQL Database Setup

This guide explains how to set up, run, and verify the local PostgreSQL database for the Quotation & Proposal Management (QTN) module.

## Database Overview
*   **Database Name:** `eventhub360_qtn_demo`
*   **Prisma Client:** Configured with PostgreSQL driver adapter (`@prisma/adapter-pg` & `pg`) for compatibility with Prisma 7.
*   **Fallback Logic:** If the `DATABASE_URL` environment variable is not defined or is offline, the backend automatically falls back to the in-memory data store.

---

## Prerequisites
1.  **PostgreSQL Instance:** Make sure PostgreSQL is running locally on port `5432`.
2.  **Database Creation:** Create the target database using your PG client (e.g. pgAdmin4) or shell:
    ```bash
    createdb -U postgres eventhub360_qtn_demo
    ```

---

## Configuration

1.  Create or update the `.env` file in the `backend/` directory.
2.  Add the database connection string:
    ```env
    DATABASE_URL="postgresql://postgres:password@localhost:5432/eventhub360_qtn_demo"
    ```
    *(Replace `postgres:password` with your local PostgreSQL username and password)*

---

## Setup and Migration Commands

Run the following commands from the `backend/` directory to sync and seed your database:

```bash
# 1. Generate the Prisma Client
npx prisma generate

# 2. Run Database Migrations to create the tables
npx prisma migrate dev --name qtn_demo_init

# 3. Seed the Database with default demo records
npx prisma db seed
```

---

## Verification

### 1. View Data in Prisma Studio
To inspect the tables and seeded records visually, run:
```bash
npx prisma studio
```
This starts an interactive UI at `http://localhost:5555` where you can view models such as:
*   `tenant`
*   `company`
*   `branch`
*   `user_account`
*   `lead`
*   `tax_rule`
*   `price_book`
*   `rate_card`
*   `package`
*   `quotation`
*   `quotation_line`
*   `quote_approval`
*   `proposal`

### 2. Verify in pgAdmin4
Open pgAdmin4, connect to your server, and inspect the `eventhub360_qtn_demo` database:
*   Go to **Schemas** -> **public** -> **Tables**.
*   You should see all 20 tables successfully created.
*   Run a query on `quotation` or `price_book` to confirm the seed data is present.

### 3. Check App Logs
When starting the dev server (`npm run start:dev`), you will see:
*   If connected: `PostgreSQL database connected successfully.`
*   If offline or `DATABASE_URL` is omitted: `No DATABASE_URL found. Running in in-memory mode.` or `Prisma failed to connect to the database. Falling back to in-memory mode.`
