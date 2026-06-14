# Quickstart & Verification Guide: Database Migration

This guide details how to execute and verify the PostgreSQL migration and multi-user setup locally and in production.

## Prerequisites

1. Active SQLite database at `prisma/dev.db` with sample data.
2. An active project on [Supabase](https://supabase.com).
3. Supabase database connection details:
   - **Transaction Pooler URL** (port 6543, standard query client):
     `DATABASE_URL="postgresql://postgres.[username]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"`
   - **Direct Session URL** (port 5432, migration client):
     `DIRECT_URL="postgresql://postgres.[username]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"`

---

## Step-by-Step Execution Checklist

### Step 1: Export Current Data
Execute the SQLite export script to backup all existing records:
```bash
npm run db:export
```
Verify that `prisma/data-export.json` exists and contains your categories, payment slips, streaks, and stats.

### Step 2: Update Schema and Environment
1. Update `prisma/schema.prisma` datasource to `postgresql`.
2. Update `.env` to define both `DATABASE_URL` and `DIRECT_URL` pointing to Supabase.

### Step 3: Push Schema to Supabase
Run Prisma DB push to provision the schema, enums, and tables in Supabase:
```bash
npx prisma db push
```

### Step 4: Import Data to Supabase
Run the import script to seed the data under a default user profile named `Principal`:
```bash
npm run db:import
```
Verify that the output console shows all categories and payment slips successfully created.

### Step 5: Test the Web Application
Start your dev server:
```bash
npm run dev
```

---

## Verification Test Cases

### Test Case 1: User Session and Login Gate
1. Open `http://localhost:3000`.
2. Verify you are intercepted by the "Quem é você?" welcome page.
3. Enter the username `Principal` and submit.
4. Verify you are redirected to the dashboard, and your migrated payment slips appear on the homepage and calendar.

### Test Case 2: Multi-User Isolation
1. Open a new incognito window (or click "Sair" if implemented, or clear LocalStorage/cookies).
2. Enter a different username: `Marques`.
3. Verify that `Marques` starts with a default empty calendar and the original 7 system categories.
4. Create a payment slip in `Marques`' dashboard.
5. Reload your regular browser window (user `Principal`) and verify that `Marques`' payment slip is NOT visible in `Principal`'s dashboard or calendar.

### Test Case 3: PT/BR status enum verification
1. Open browser DevTools Network tab.
2. Toggle a bill's payment status.
3. Inspect the `PUT /api/slips/[id]` request payload.
4. Verify that the sent `status` value is either `"PAGO"` or `"PENDENTE"` (strictly Portuguese enums).
