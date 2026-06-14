# Feature Specification: Persistent Database Migration

**Feature Branch**: `004-persistent-db-migration`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "quero migrar o banco de dados para um banco de dados onde eu possa ter esse webapp rodando no meu celular e futuramente disponibilizar para outras pessoas, sem que eu perca os dados quando o servidor reniciar"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cloud Persistence and Remote Access (Priority: P1)

As a user, I want my financial data to be stored in a cloud-hosted persistent database (such as Neon or Supabase PostgreSQL), so that I can access the app from my mobile phone, tablet, and desktop, and keep my data safe and persistent across server redeploys or restarts.

**Why this priority**: This is the core requirement. Moving from a local SQLite file (which is ephemeral on cloud hosting platforms like Vercel or Render) to a managed cloud database is what enables multi-device usage and ensures persistence.

**Independent Test**: The user can access the app via a public URL on their phone, add a payment slip, reload the app (or restart the hosting server), and see that the data remains intact and matches what is shown on their desktop browser.

**Acceptance Scenarios**:

1. **Given** the app is deployed on a cloud hosting platform and connected to a cloud PostgreSQL database, **When** the hosting platform restarts or redeploys the server container, **Then** all previously entered categories, bills, achievements, and stats remain fully intact.
2. **Given** the user adds a bill on their mobile phone, **When** they open the app on their computer, **Then** the newly added bill appears on the calendar and homepage dashboard in real-time.
3. **Given** a new user accesses the app, **When** the database is initialized, **Then** default categories (seed data) and default stats are automatically created if they do not exist.

---

### User Story 2 - Environment-Based Database Configuration (Priority: P2)

As a developer/administrator, I want to configure the database connection using standard environment variables, so that I can run the application locally on a development database and securely in production on the live database.

**Why this priority**: Proper environment configuration is essential for secure deployments and separate environments (dev vs prod), which prevents overwriting production data during development.

**Independent Test**: Setting `DATABASE_URL` in a local `.env` file connects the local dev server to the development database, while changing the environment variable in production redirects the production build to the live cloud database.

**Acceptance Scenarios**:

1. **Given** a `.env` file exists with a local or staging database URL, **When** the developer runs `npm run dev`, **Then** the dev server connects to that database.
2. **Given** the production server has the `DATABASE_URL` environment variable set, **When** the server builds and starts, **Then** the application securely connects to the production database without leaking credentials in the source code.

---

### User Story 3 - SQLite to PostgreSQL Data Porting (Priority: P3)

As a user, I want to migrate my existing data from the local SQLite database (`prisma/dev.db`) to the new PostgreSQL database, so that I don't lose any category configs, historical bills, or streaks I have already created.

**Why this priority**: Ensures a seamless transition from the old local-only SQLite development setup to the new cloud-hosted setup.

**Independent Test**: A migration script or process is executed, transferring all records from the SQLite database to the cloud PostgreSQL database. After execution, the cloud database contains all the original data.

**Acceptance Scenarios**:

1. **Given** the local SQLite database has active records (payment slips, categories, user stats), **When** the migration script is run against the PostgreSQL database, **Then** all categories, payment slips, achievements, and user stats are successfully copied to PostgreSQL with relations intact.

---

### Edge Cases

- **Database Connection Failure**: If the cloud database is temporarily unreachable or slow, the application should display a user-friendly error message or attempt to reconnect instead of crashing.
- **Serverless Connection Pooling**: Serverless environments (like Vercel) can exhaust database connection pools rapidly. The database setup must utilize connection pooling (e.g. Prisma Accelerator or connection pool configuration in the URL) to avoid connection limits.
- **Schema Synchronization**: Any subsequent schema updates must be easily deployable to production using standard migration scripts (`prisma migrate deploy`) without data loss.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST connect to a PostgreSQL database provider instead of SQLite.
- **FR-002**: The Prisma schema MUST be updated to use the `postgresql` provider and compatible data types.
- **FR-003**: The database connection string MUST be read dynamically from the `DATABASE_URL` environment variable.
- **FR-004**: The system MUST support database migrations using Prisma's migration CLI (`prisma migrate dev` for development, `prisma migrate deploy` for production).
- **FR-005**: The system MUST support seeding initial/default data (e.g. system default categories, initial user stats) on new databases.
- **FR-006**: The system MUST run securely over SSL when connecting to production databases.

### Key Entities *(include if feature involves data)*

- **Category** (Existing): Represents expense categories. Updated schema must be fully compatible with PostgreSQL types.
- **PaymentSlip** (Existing): Represents bills/slips. Updated schema must handle `Float` (as Double Precision or Decimal) and `DateTime` correctly on PostgreSQL.
- **Achievement** (Existing): Represents streak milestones. Updated schema must be fully compatible with PostgreSQL.
- **UserStats** (Existing): User settings and streaks. Updated schema must be fully compatible with PostgreSQL.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The database query response times (fetching bills, toggling status) in the cloud environment remain under 400 milliseconds.
- **SC-002**: Data persistence is 100% reliable — zero records are lost during server restarts, redeployments, or container recycling.
- **SC-003**: Multiple devices (desktop and mobile) can query and modify the same database simultaneously, showing consistent state on refresh.
- **SC-004**: Database migration and seeding run automatically or via a single-command deploy pipeline.

## Assumptions

- The user will create a free/hobby PostgreSQL database on a cloud platform (such as Supabase, Neon, or Railway) and provide the connection URL.
- The web app will be hosted on a cloud platform (like Vercel, Render, or Railway) that allows setting the `DATABASE_URL` environment variable.
- SQLite-specific features are not used in the Next.js API route handlers, so changing the database provider will not break query logic.
