# Quickstart & Verification Guide: Category Management (CRUD)

This guide provides setup and end-to-end validation scenarios to confirm the Category CRUD feature works correctly. It assumes the base app from `001-finance-manager` is already bootstrapped.

See [data-model.md](./data-model.md) for schema details and [contracts/api.md](./contracts/api.md) for API endpoint specs.

## Prerequisites

1. **Node.js** (LTS version) and **npm** installed.
2. The `001-finance-manager` implementation is in place (Prisma schema, `src/lib/prisma.ts`, `src/app/globals.css` design tokens).
3. The `prisma/schema.prisma` has been updated with `isSystemDefault` and `createdAt` fields on `Category` and `onDelete: Restrict` on `PaymentSlip.categoryId`.

## Setup

```bash
# 1. Install any new dependencies (no new packages needed for this feature)
npm install

# 2. Apply the updated schema migration
npx prisma migrate dev --name add-category-system-default

# 3. Re-run the seed script to ensure system default categories are present
npx prisma db seed

# 4. Start the development server
npm run dev
```

**Expected after setup**:
- `prisma/dev.db` updated with new `isSystemDefault` and `createdAt` columns on `Category`.
- 6 system categories present in the DB (`Uncategorized`, `Rent`, `Utilities`, `Food`, `Leisure`, `Credit Card`), all with `isSystemDefault: true`.
- App running at `http://localhost:3000`.

---

## Verification Scenarios

### Scenario 1: View Category List

1. Open `http://localhost:3000/categories`.
2. Verify the page renders with heading `Gerenciar Categorias`.
3. Verify all 6 system default categories appear as styled cards with their name, color swatch, Lucide icon, and slip count (`0` for a fresh DB).
4. Verify system categories show a locked/protected indicator (no Delete button, or grayed-out Delete button).

**Expected**: All 6 seed categories rendered; no JS errors in the console.

---

### Scenario 2: Create a New Category

1. Click **"Adicionar Categoria"**.
2. In the modal, type the name `Transport`.
3. Select the teal color swatch (`#14b8a6`).
4. Select the `Car` icon.
5. Click **Save**.

**Expected**:
- The modal closes.
- `Transport` appears in the category list with the teal swatch and car icon.
- `_count.slips` shows `0`.
- `GET /api/categories` returns the new entry.

---

### Scenario 3: Validation — Duplicate Name

1. Click **"Adicionar Categoria"**.
2. Type `Utilities` (same as an existing system category, different casing: `utilities`).
3. Click **Save**.

**Expected**:
- Modal stays open.
- Inline error: *"A category with this name already exists."*
- No new record created (`GET /api/categories` count unchanged).

---

### Scenario 4: Validation — Empty Name

1. Click **"Adicionar Categoria"**.
2. Leave the name field blank.
3. Click **Save**.

**Expected**:
- Modal stays open.
- Inline validation error: *"Category name is required."*

---

### Scenario 5: Edit an Existing Category

1. Locate the `Transport` category card.
2. Click the **Edit** (pencil) button.
3. In the modal, change the name to `Transportation` and change the icon to `Train`.
4. Click **Save**.

**Expected**:
- Modal closes.
- Category card now shows `Transportation` and the Train icon.
- Name change is reflected in `GET /api/categories` response.
- Any linked payment slips remain associated (verify via `GET /api/slips`).

---

### Scenario 6: Delete a Category — Slip Reassignment

1. Create a test payment slip linked to `Transportation` (via the main slips UI or directly via `POST /api/slips`).
2. Navigate back to `/categories`.
3. Click **Delete** on the `Transportation` category.
4. Confirm the warning dialog (which states: *"All linked payment slips will be moved to Uncategorized"*).

**Expected**:
- `Transportation` is removed from the category list.
- `GET /api/categories` no longer includes `Transportation`.
- The previously linked slip now has `categoryId` pointing to `Uncategorized` (verify via `GET /api/slips`).

---

### Scenario 7: System Default Category — Delete Blocked

1. Attempt to click **Delete** on the `Utilities` category card.

**Expected**:
- Either the Delete button is absent/disabled on system categories, **or** if clicked, returns an error message: *"System default categories cannot be deleted."*
- No record is deleted. `GET /api/categories` unchanged.

---

### Scenario 8: Search / Filter

1. Navigate to `/categories` (with at least 3 user-created categories present).
2. Type `trans` into the search input.

**Expected**:
- Only categories whose names contain `trans` (case-insensitive) are displayed.
- Results update without a page reload, within 1 second of typing.
- Clearing the search input restores the full list.

---

### Scenario 9: Empty State

1. (This scenario can be verified on a fresh DB before any user categories are created.)
2. Navigate to `/categories` when only system default categories exist.

**Note**: The empty state applies when **no categories at all** exist — this would only occur if the seed is not run. In normal operation, system defaults are always present. Test by temporarily removing the seed categories from the DB to confirm the empty-state UI renders a friendly message and "Adicionar Categoria" CTA.
