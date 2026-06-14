# Tasks: Persistent Database Migration & Multi-User Support

**Input**: Design documents from `/specs/004-persistent-db-migration/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project configuration changes and migration scripts setup.

- [ ] T001 Configure `.env` structure to specify Supabase `DATABASE_URL` (pooler) and `DIRECT_URL` (direct connections).
- [ ] T002 [P] Register script hooks in `package.json` to enable commands `db:export` and `db:import`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backup current data, modify schema to connect to Supabase, push the tables, and load the data.

**⚠️ CRITICAL**: No user story implementation or UI changes can begin until this data migration is complete.

- [ ] T003 Create data backup utility in `prisma/export.ts` to dump SQLite database content to `prisma/data-export.json`.
- [ ] T004 Run SQLite database export `npm run db:export` to dump categories, payment slips, stats, and achievements to a JSON file.
- [ ] T005 Update the database configuration in `prisma/schema.prisma` to use provider `postgresql`, add `User` model, declare `SlipStatus` enum (`PAGO`, `PENDENTE`), and link existing models to `User`.
- [ ] T006 Initialize the Supabase PostgreSQL database tables and enums using `npx prisma db push`.
- [ ] T007 Create data restore utility in `prisma/import.ts` to read `prisma/data-export.json`, provision a default user profile named `Principal`, map statuses to enums, and seed the Supabase database.
- [ ] T008 Run the database import `npm run db:import` to load all ported records into Supabase.

**Checkpoint**: Foundation ready - existing data is safe on Supabase and ready for scoped multi-user queries.

---

## Phase 3: User Story 1 - Supabase Scoping & Multi-User Identification (Priority: P1) 🎯 MVP

**Goal**: Block access to database records unless a user session exists, and scope all API routes to filter data by user ID.

**Independent Test**: Opening the app on a fresh device forces the identification gate. Typing a username creates or retrieves the user profile and updates LocalStorage, and all fetches automatically append the `x-user-id` header.

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create the authentication screen and its CSS module in `src/components/AuthProvider/AuthProvider.tsx` and `src/components/AuthProvider/AuthProvider.module.css`.
- [ ] T010 [US1] Update `src/app/layout.tsx` to wrap `{children}` within the client-side `AuthProvider`.
- [ ] T011 [P] [US1] Create the backend authentication router at `src/app/api/auth/route.ts` to create/fetch a User profile and copy default system categories.
- [ ] T012 [US1] Refactor `src/app/api/slips/route.ts` and `src/app/api/slips/[id]/route.ts` to read the `x-user-id` header and filter all payment slips queries by user ID.
- [ ] T013 [US1] Refactor `src/app/api/categories/route.ts` and `src/app/api/categories/[id]/route.ts` to read the `x-user-id` header and return system-wide default categories + user custom categories.
- [ ] T014 [US1] Refactor user limits dashboard queries in `src/app/api/stats/route.ts` to fetch and update stats scoped to the logged-in user ID.
- [ ] T015 [US1] Update streak recalculations and fetching in `src/app/api/achievements/route.ts` to scope operations per user ID.

**Checkpoint**: At this point, User Story 1 is fully functional. Users can log in from separate devices using their name and view their isolated dashboards.

---

## Phase 4: User Story 2 - PT/BR Status Enum UI Refactoring (Priority: P2)

**Goal**: Refactor the codebase to replace all references to `"Paid"` / `"Pending"` status strings with strict compiler-safe `SlipStatus` enums (`PAGO`, `PENDENTE`).

**Independent Test**: Bills can be created and toggled, saving their status as `PAGO` or `PENDENTE` in the Supabase database. Charts and summary cards display totals correctly.

### Implementation for User Story 2

- [ ] T016 [P] [US2] Update helper types and status derivation logic in `src/lib/calendar.ts` to match `PAGO` and `PENDENTE` values.
- [ ] T017 [US2] Update charts filter checks in `src/components/DashboardCharts/DashboardCharts.tsx` and card totals inside `SummaryCards.tsx` to check for `SlipStatus` enums.
- [ ] T018 [US2] Refactor status comparison and visual indicators inside `src/components/SlipList/SlipItem.tsx`.
- [ ] T019 [US2] Update calendar status toggle APIs and page handlers in `src/app/page.tsx` and `src/app/calendar/page.tsx` to send `"PAGO"` or `"PENDENTE"`.
- [ ] T020 [US2] Update HTML input option values and form submit payloads inside `src/components/AdicionarBoleto/AdicionarBoleto.tsx` to match the enums.

**Checkpoint**: All status-related components and operations are fully migrated to database enums, avoiding raw English string comparisons.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Performance checking, documentation updates, and quickstart verification.

- [ ] T021 Document environment variables and setup details in `README.md`.
- [ ] T022 Run quickstart validation scenarios from `specs/004-persistent-db-migration/quickstart.md` across mobile and desktop browser windows.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - starts immediately.
- **Foundational (Phase 2)**: Depends on Setup - **BLOCKS** all other phases (data must be safe before code updates).
- **User Stories (Phases 3-4)**: Depend on Foundational completion. Phase 3 (Auth Gate) should be completed before Phase 4 (Enum refactor).
- **Polish (Phase 5)**: Depends on all user stories being complete.

### Parallel Opportunities

- Setup tasks `T001` and `T002` can run in parallel.
- `T009` (AuthProvider frontend) and `T011` (Auth API route) can be developed in parallel.
- Refactoring user stats (`T014`) and achievements (`T015`) API routes can be done in parallel.
- Updating calendar helper logic (`T016`) can run in parallel with UI styling tweaks.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational data porting.
2. Complete `AuthProvider` login view and fetch header interceptor.
3. Update slips API routes to read `x-user-id` and filter results.
4. **STOP and VALIDATE**: Open the browser, sign in, and confirm existing data loads.

### Incremental Delivery

1. Deploy base database structure + Auth Gate -> verify multi-device sync is working.
2. Apply status enum refactoring locally -> verify page logic -> deploy to production.
