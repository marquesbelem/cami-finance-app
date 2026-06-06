# Tasks: Category Management (CRUD)

**Feature**: `002-category-crud`
**Input**: Design documents from `/specs/002-category-crud/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · data-model.md ✅ · contracts/api.md ✅ · research.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Exact file paths are included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Schema migration and database preparation — prerequisite for all user stories.

- [ ] T001 Add `isSystemDefault Boolean @default(false)` and `createdAt DateTime @default(now())` fields to the `Category` model in `prisma/schema.prisma`
- [ ] T002 Change `PaymentSlip.category` relation `onDelete` from `Cascade` to `Restrict` in `prisma/schema.prisma`
- [ ] T003 Run Prisma migration: `npx prisma migrate dev --name add-category-system-default`
- [ ] T004 Update `prisma/seed.ts` to upsert all 6 system-default categories (`Uncategorized`, `Rent`, `Utilities`, `Food`, `Leisure`, `Credit Card`) with `isSystemDefault: true` and the color/icon values specified in `data-model.md`
- [ ] T005 Run `npx prisma db seed` to apply seed data to `prisma/dev.db`

**Checkpoint**: Database schema is migrated and seeded — all user story phases may now begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API route files and shared type definitions that every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 Create the API route handler file `src/app/api/categories/route.ts` with empty `GET` and `POST` exports (scaffolding only — implementations added per story)
- [ ] T007 Create the API route handler file `src/app/api/categories/[id]/route.ts` with empty `PUT` and `DELETE` exports (scaffolding only)
- [ ] T008 [P] Define shared TypeScript type `CategoryWithCount` (category fields + `_count: { slips: number }`) in `src/lib/types.ts` (or extend existing types file)
- [ ] T009 [P] Add `"Categorias"` navigation link to `src/app/layout.tsx` pointing to `/categories`

**Checkpoint**: Foundation ready — user story phases can now begin.

---

## Phase 3: User Story 2 — View All Categories (Priority: P1) 🎯 MVP

**Goal**: Render the `/categories` page with all saved categories displayed as styled cards, including name, color, icon, slip count, and an empty-state for zero categories.

**Independent Test**: Navigate to `http://localhost:3000/categories`. Verify all 6 seeded system-default categories appear as styled cards with their name, color swatch, icon, and slip count. Verify that the empty-state CTA is shown when all categories are deleted.

### Implementation for User Story 2

- [ ] T010 [P] [US2] Create `src/components/CategoryCard/CategoryCard.tsx` — renders a single category card with name, color swatch (`colorCode`), Lucide icon (`iconRef`), slip count badge, and Edit/Delete action buttons; system-default cards must disable the Delete button with a tooltip
- [ ] T011 [P] [US2] Create `src/components/CategoryCard/CategoryCard.module.css` — dark-mode card styles with hover-lift micro-animation, color-swatch pill, icon container, action button states (per constitution: no Tailwind, CSS Modules only)
- [ ] T012 [P] [US2] Create `src/components/CategoryList/CategoryList.tsx` — renders a responsive grid of `CategoryCard` components; handles empty-state illustration + "Create your first category" CTA when list is empty; renders a search/filter `<input>` when list has more than 10 entries
- [ ] T013 [P] [US2] Create `src/components/CategoryList/CategoryList.module.css` — grid layout, search input styles, empty-state illustration styles
- [ ] T014 [US2] Implement `GET /api/categories` in `src/app/api/categories/route.ts` — query all categories via `prisma.category.findMany({ include: { _count: { select: { slips: true } } }, orderBy: { name: 'asc' } })` using the existing Prisma Client singleton at `src/lib/prisma.ts`; return `200` JSON array of `CategoryWithCount`
- [ ] T015 [US2] Create `src/app/categories/page.tsx` — Next.js App Router page that fetches categories via `GET /api/categories`, renders `<CategoryList>`, includes `<title>Gerenciar Categorias</title>` meta, unique `<h1>Gerenciar Categorias</h1>`, and an "Adicionar Categoria" button that opens the `CategoryFormModal`

**Checkpoint**: User Story 2 is fully functional — the `/categories` page displays all categories with correct data.

---

## Phase 4: User Story 1 — Create a New Category (Priority: P1)

**Goal**: Allow the user to open a modal, fill in name/color/icon, save, and see the new category appear in the list with full validation.

**Independent Test**: Click "Adicionar Categoria" on the `/categories` page. Fill in name "Transport", pick a teal color, select the `Car` icon, and click Save. Verify the new card appears in the list. Attempt to save with a blank name and verify the inline error "Category name is required". Attempt to save a duplicate name and verify the 409 conflict error is surfaced.

### Implementation for User Story 1

- [ ] T016 [P] [US1] Create `src/components/CategoryFormModal/CategoryFormModal.tsx` — modal dialog for create/edit; includes: name `<input>` with 50-char counter (`id="category-name-input"`), color picker with 12 preset swatches + hex input (`id="category-color-picker"`), icon picker grid showing 20–40 curated Lucide finance icons (`id="category-icon-picker"`), inline validation error display, Save and Cancel buttons (`id="modal-save-btn"`, `id="modal-cancel-btn"`); accepts `category` prop (null = create mode, populated = edit mode)
- [ ] T017 [P] [US1] Create `src/components/CategoryFormModal/CategoryFormModal.module.css` — modal overlay + slide-in animation, color swatch grid, icon grid, form field styles, error message styles, character counter (per constitution micro-animations rule)
- [ ] T018 [US1] Implement `POST /api/categories` in `src/app/api/categories/route.ts` — parse and validate request body (name: required, non-empty, max 50 chars; colorCode: required, valid `#rrggbb`; iconRef: required from curated list); perform case-insensitive uniqueness check via Prisma; return `201 Created` with the new category or `400`/`409` error JSON as specified in `contracts/api.md`
- [ ] T019 [US1] Wire `CategoryFormModal` into `src/app/categories/page.tsx` — open modal on "Adicionar Categoria" button click; on successful save call `POST /api/categories`, close modal, and optimistically refresh the category list without full page reload

**Checkpoint**: User Story 1 is fully functional — categories can be created with validation.

---

## Phase 5: User Story 3 — Edit an Existing Category (Priority: P2)

**Goal**: Allow the user to click Edit on any category card, modify name/color/icon, save, and see the updated data reflected in the list — without any payment slip losing its category link.

**Independent Test**: Click Edit on the "Leisure" card. Change the name to "Entertainment" and the color. Click Save. Verify the card in the list now shows "Entertainment" with the new color. Verify that payment slips previously linked to "Leisure" are still accessible under "Entertainment".

### Implementation for User Story 3

- [ ] T020 [US3] Implement `PUT /api/categories/[id]` in `src/app/api/categories/[id]/route.ts` — parse dynamic `[id]` param; validate that category exists (404 if not); apply same validation rules as POST for each provided field; perform case-insensitive uniqueness check excluding the current record; update via `prisma.category.update`; return `200` with updated `CategoryWithCount` or `400`/`404`/`409` errors per `contracts/api.md`
- [ ] T021 [US3] Wire Edit action in `src/components/CategoryCard/CategoryCard.tsx` — clicking Edit (`id="edit-category-{id}-btn"`) calls the `onEdit` callback passed from `CategoryList`, which opens `CategoryFormModal` pre-populated with the category's current `name`, `colorCode`, and `iconRef`
- [ ] T022 [US3] Handle edit submission in `src/app/categories/page.tsx` — on successful `PUT /api/categories/[id]` response, update the category in local state and re-render `CategoryList` without a full page reload

**Checkpoint**: User Story 3 is fully functional — categories can be edited without data loss.

---

## Phase 6: User Story 4 — Delete a Category (Priority: P3)

**Goal**: Allow the user to delete a user-created category with a confirmation dialog; linked payment slips are automatically reassigned to "Uncategorized"; system-default categories are blocked from deletion.

**Independent Test**: Delete the "Transport" category that has 2 linked slips. Confirm in the dialog. Verify "Transport" is removed from the list and its 2 slips are now listed under "Uncategorized". Attempt to delete "Uncategorized" and verify the system blocks it with an appropriate message.

### Implementation for User Story 4

- [ ] T023 [US4] Implement `DELETE /api/categories/[id]` in `src/app/api/categories/[id]/route.ts` — look up category; return `403 Forbidden` if `isSystemDefault: true`; return `404` if not found; otherwise execute a Prisma transaction that: (1) reassigns all linked `PaymentSlip` records' `categoryId` to the system "Uncategorized" category ID, (2) deletes the category; return `204 No Content` on success per `contracts/api.md`
- [ ] T024 [US4] Add delete confirmation dialog to `src/components/CategoryCard/CategoryCard.tsx` — clicking Delete (`id="delete-category-{id}-btn"`) on non-system categories opens an inline or overlay confirmation dialog explaining that linked slips will be moved to "Uncategorized"; Cancel (`id="delete-cancel-btn"`) aborts; Confirm (`id="delete-confirm-btn"`) proceeds; system-default cards show a disabled Delete button with a tooltip explaining the restriction
- [ ] T025 [US4] Handle delete submission in `src/app/categories/page.tsx` — on successful `DELETE /api/categories/[id]` response, remove the category from local state and re-render `CategoryList`; surface the 403 error message if a system-default deletion is attempted

**Checkpoint**: All 4 user stories are fully functional and independently testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements spanning multiple stories — search/filter, animations, error boundary, accessibility polish.

- [ ] T026 [P] Implement client-side search/filter in `src/components/CategoryList/CategoryList.tsx` — show search `<input id="category-search-input">` when list has > 10 entries; filter by name on `onChange` (debounced, ≤ 1 s); show friendly empty-state "No categories match your search" with a clear-search CTA when results are empty
- [ ] T027 [P] Add fade-out animation on delete confirmation to `src/components/CategoryCard/CategoryCard.module.css` and slide-in animation on modal open to `src/components/CategoryFormModal/CategoryFormModal.module.css` (per constitution Principle II)
- [ ] T028 [P] Verify all interactive elements have unique descriptive `id` attributes across `CategoryCard`, `CategoryList`, `CategoryFormModal`, and `src/app/categories/page.tsx` (per constitution Principle V)
- [ ] T029 Run quickstart.md validation scenarios manually to confirm all acceptance criteria from spec.md are satisfied

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — **blocks all user story phases**
- **Phase 3 (US2 – View)**: Depends on Phase 2 ✅
- **Phase 4 (US1 – Create)**: Depends on Phase 2 ✅ and Phase 3 (requires `CategoryFormModal` wired into page)
- **Phase 5 (US3 – Edit)**: Depends on Phase 4 (`CategoryFormModal` reused in edit mode)
- **Phase 6 (US4 – Delete)**: Depends on Phase 2 ✅ (independently testable after foundational)
- **Phase 7 (Polish)**: Depends on all user story phases being complete

### User Story Dependencies

- **US2 (View — P1)**: No story dependencies — first to implement
- **US1 (Create — P1)**: Depends on US2 (modal wires into page from Phase 3)
- **US3 (Edit — P2)**: Depends on US1 (`CategoryFormModal` reused in edit mode)
- **US4 (Delete — P3)**: Depends on Phase 2 only — can be worked independently of US1/US3

### Within Each Phase

- Models/schema → Services/API handlers → UI components → Page integration
- Parallelizable tasks (marked `[P]`) touch different files with no shared dependencies

---

## Parallel Execution Examples

### Phase 3 (US2 – View All Categories)

```bash
# These can run concurrently:
Task T010: Create CategoryCard.tsx
Task T011: Create CategoryCard.module.css
Task T012: Create CategoryList.tsx
Task T013: Create CategoryList.module.css
# Then T014 (GET endpoint) and T015 (page assembly) when components are ready
```

### Phase 4 (US1 – Create)

```bash
# These can run concurrently:
Task T016: Create CategoryFormModal.tsx
Task T017: Create CategoryFormModal.module.css
Task T018: Implement POST /api/categories
# Then T019 (wire modal into page) when all three are done
```

### Phase 7 (Polish)

```bash
# All three can run concurrently:
Task T026: Search/filter implementation
Task T027: Animation polish
Task T028: ID/accessibility audit
```

---

## Implementation Strategy

### MVP First (US2 + US1 Only — View + Create)

1. Complete Phase 1: Schema migration & seeding
2. Complete Phase 2: Foundational scaffolding (CRITICAL)
3. Complete Phase 3: US2 (View All)
4. Complete Phase 4: US1 (Create)
5. **STOP and VALIDATE**: Users can view and create categories — core loop functional
6. Demo/deploy if ready

### Incremental Delivery

1. Phase 1 + 2 → Database and API scaffold ready
2. Phase 3 (US2) → Category list page functional → Demo
3. Phase 4 (US1) → Create modal functional → MVP!
4. Phase 5 (US3) → Edit functionality → Demo
5. Phase 6 (US4) → Delete with safety mechanism → Full CRUD
6. Phase 7 → Polish, search, animation → Production-ready

---

## Notes

- `[P]` tasks touch different files with no dependencies on incomplete sibling tasks in the same phase
- `[Story]` labels map each task to a specific user story for traceability
- All Prisma operations must use the existing singleton at `src/lib/prisma.ts` (never instantiate a new `PrismaClient`)
- All styles must be CSS Modules (`.module.css`) extending variables from `src/app/globals.css` — no Tailwind
- No tests are generated: tests were not explicitly requested in the feature specification
- Commit after each phase checkpoint or logical group of tasks
