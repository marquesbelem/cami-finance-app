# Technical Research: Database Migration & Scoping

## Decision 1: Database Host & Client Scoping
- **Decision**: Supabase PostgreSQL database + local storage username session with a global header interceptor.
- **Rationale**: Supabase provides free PostgreSQL instances. Next.js serverless routes will connect to Supabase. To identify users without introducing standard OAuth/next-auth (which are heavy, require secrets, email config, and setup), a lightweight layout gate will query/create users based on their username, store their `user.id` in `localStorage`, and intercept all `fetch` requests to inject `x-user-id`.
- **Alternatives considered**:
  1. **NextAuth / Supabase Auth**: Rejected due to high implementation complexity, setup, and dependency management. The user requested simplicity.
  2. **Neon serverless**: Fully viable alternative, but Supabase was explicitly requested by the user.

## Decision 2: Payment Slip Status Enum
- **Decision**: Native Postgres Database Enum `SlipStatus` with values `PAGO` and `PENDENTE` in Portuguese.
- **Rationale**: Enforcing a strict enum at the database level eliminates spelling inconsistencies (e.g. `"Paid"`, `"paid"`, `"Pending"`) and is mapped automatically to TypeScript types by Prisma.
- **Alternatives considered**:
  1. **TypeScript-only Enum / DB String**: Rejected because database consistency is not guaranteed. Native DB enums are safer.
  2. **English Enums (`PAID`, `PENDING`)**: Rejected because the user requested PT/BR status names (`PAGO`, `PENDENTE`) directly in the codebase.

## Decision 3: SQLite to PostgreSQL Data Porting
- **Decision**: Export SQLite data to JSON *before* changing `schema.prisma` provider, then push the postgres schema and import the data.
- **Rationale**: Since Prisma client is generated statically, running a script with a dual-provider config is complex. Exporting to a JSON file first is dialect-agnostic and guarantees zero data loss. During import, the script maps all old data to a default user profile named `Principal`.
