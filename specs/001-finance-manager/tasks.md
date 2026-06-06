# Tasks: Gamified Personal Finance Manager

**Input**: Design documents from `/specs/001-finance-manager/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure directories (prisma, public/uploads, src/app, src/components, src/lib)
- [x] T002 Initialize Next.js project and install dependencies (prisma, @prisma/client, recharts, lucide-react) in package.json
- [x] T003 [P] Configure Prisma datasource configuration in prisma/schema.prisma

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema and styling variables that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Define SQLite data models (Category, PaymentSlip, Achievement, UserStats) in prisma/schema.prisma
- [x] T005 Implement database seed script to populate default categories (Rent, Food, Utilities, Credit Card) in prisma/seed.ts
- [x] T006 [P] Implement Prisma client connection helper in src/lib/prisma.ts
- [x] T007 [P] Establish global CSS variables (Harmony color palette, dark mode default, fonts) in src/app/globals.css
- [x] T008 Setup default page layout structure in src/app/layout.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Payment Slip Management (CRUD) (Priority: P1) 🎯 MVP

**Goal**: Support basic bill entry, categorization, deletion, and file uploading.

**Independent Test**: The user can navigate to the payments section, add a slip with an amount, due date, attach a bill document, and category, verify it appears in the list, edit its details, and delete it.

### Implementation for User Story 1
- [x] T009 [P] [US1] Create API endpoint for creating and retrieving slips in src/app/api/slips/route.ts
- [x] T010 [P] [US1] Create API endpoint for updating and deleting slips in src/app/api/slips/[id]/route.ts
- [x] T011 [US1] Implement file upload utility to save PDF/Image files locally to public/uploads/ in src/lib/upload.ts
- [x] T012 [P] [US1] Build "Adicionar Boleto" form component and styles in src/components/AdicionarBoleto/AdicionarBoleto.tsx and src/components/AdicionarBoleto/AdicionarBoleto.module.css
- [x] T013 [P] [US1] Build bill list and slip detail items in src/components/SlipList/SlipItem.tsx and src/components/SlipList/SlipItem.module.css
- [x] T014 [US1] Integrate CRUD form and list components on the main dashboard view in src/app/page.tsx

**Checkpoint**: At this point, User Story 1 (MVP) is fully functional and testable.

---

## Phase 4: User Story 2 - Monthly Dashboard & Analytics (Priority: P2)

**Goal**: Provide visual charts of expenses and filtering of slips per month.

**Independent Test**: The user can select different months from a dropdown and verify the charts and totals change to match only the slips for that month.

### Implementation for User Story 2
- [x] T015 [P] [US2] Update API endpoint to support month filtering in src/app/api/slips/route.ts
- [x] T016 [US2] Add month selection state and controls in src/app/page.tsx
- [x] T017 [P] [US2] Create charts visualization dashboard using Recharts in src/components/DashboardCharts/DashboardCharts.tsx and src/components/DashboardCharts/DashboardCharts.module.css
- [x] T018 [US2] Add monthly summary metrics cards (Total Spent, Pending Bills) in src/components/DashboardCharts/SummaryCards.tsx
- [x] T019 [US2] Integrate chart components with month selection on the main dashboard in src/app/page.tsx

**Checkpoint**: User Stories 1 and 2 work together, providing a complete monthly filterable CRUD dashboard.

---

## Phase 5: User Story 3 - Credit Card Savings Achievements (Priority: P3)

**Goal**: Enable custom user-defined savings goals and display streak celebrations.

**Independent Test**: The user can view achievements, customize card limits, write rules, and see dynamic streak logs.

### Implementation for User Story 3
- [x] T020 [P] [US3] Create user statistics/limits API endpoint in src/app/api/stats/route.ts
- [x] T021 [P] [US3] Create user custom achievements API endpoint in src/app/api/achievements/route.ts
- [x] T022 [US3] Implement validation triggers to compute achievement progress on slip mutations in src/lib/achievements.ts
- [x] T023 [P] [US3] Build Achievements Panel UI to list progress and create custom goals in src/components/Achievements/AchievementsPanel.tsx and src/components/Achievements/AchievementsPanel.module.css
- [x] T024 [US3] Add toast celebrations and unlock particle alerts in src/components/Achievements/Celebration.tsx
- [x] T025 [US3] Integrate Achievements Panel into the dashboard sidebar in src/app/page.tsx

**Checkpoint**: Full application feature set is implemented.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Global responsiveness adjustments, transitions, and user documentation

- [x] T026 [P] Update user setup and startup guide in README.md
- [x] T027 Add layout transitions, micro-animations on interactive states, and hover effects in src/app/globals.css
- [x] T028 Run end-to-end verification checklist in specs/001-finance-manager/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. Blocks all user stories.
- **User Stories (Phases 3+)**: Depend on Foundational completion. Can run sequentially or concurrently.
- **Polish (Phase 6)**: Depends on all user stories being complete.

### Parallel Opportunities
- All Phase 1, Phase 2 tasks marked with `[P]` can run in parallel (since they edit different files).
- Once Phase 2 (Foundational) is completed:
  - Developer A can work on User Story 1 (`T009`–`T014`).
  - Developer B can start work on User Story 2 structures (`T015`–`T019`).
  - Developer C can design User Story 3 APIs (`T020`–`T022`).
- Within each story phase, tasks marked `[P]` can run concurrently.

---

## Parallel Example: Setup
```bash
# Developer A configures Prisma
Task: "Configure Prisma datasource configuration in prisma/schema.prisma"

# Developer B sets up folder structures
Task: "Create project structure directories (prisma, public/uploads, src/app, src/components, src/lib)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Setup (Phase 1)
2. Complete Foundational (Phase 2)
3. Implement User Story 1 (Phase 3)
4. **VALIDATION**: Test adding, listing, editing, and deleting slips (with attachments).

### Incremental Delivery
- Step 1: Deliver MVP slip log.
- Step 2: Add Recharts visualization and month filtering (User Story 2).
- Step 3: Add Achievements panel, limits configurator, and notifications (User Story 3).
