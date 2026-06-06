# Research & Technical Decisions: Category Management (CRUD)

## 1. Database: Extending the Existing SQLite + Prisma Setup

- **Decision**: Extend the `Category` model in the existing `prisma/schema.prisma` with an `isSystemDefault` boolean field. No new database or ORM is introduced.
- **Rationale**: The `001-finance-manager` plan established SQLite (file `prisma/dev.db`) via Prisma ORM as the project's persistence layer. This feature builds on top of that foundation without diverging. A single `isSystemDefault: Boolean @default(false)` field is all that is needed to enforce the "system categories cannot be deleted" rule from the spec (FR-007).
- **Alternatives Considered**:
  - *Separate table for system categories*: Rejected — over-engineering for a single boolean flag.
  - *Hard-coded check in API route*: Rejected — fragile and not persisted; the flag in the DB is the authoritative source of truth.

## 2. Cascading Behavior on Category Delete: Slip Reassignment

- **Decision**: When deleting a category, the API route will first update all `PaymentSlip` records with `categoryId = deletedCategoryId` to point to the system "Uncategorized" category's ID, and then delete the category.
- **Rationale**: The existing `001-finance-manager` data model specifies `onDelete: Cascade` on `PaymentSlip.categoryId`, which would delete the slips along with the category. The spec (FR-004, Edge Cases) explicitly requires slips to be reassigned to "Uncategorized", not deleted. The API route handles this in a Prisma transaction to maintain atomicity.
- **Alternatives Considered**:
  - *`onDelete: SetNull` in Prisma schema*: Would set `categoryId` to null, creating orphaned slips with no category. The UI would need to handle nullable categories everywhere — adds complexity.
  - *Keep `onDelete: Cascade`*: Destroys financial data, violating SC-006.
- **Schema Change Required**: Update `onDelete: Cascade` → `onDelete: Restrict` on `PaymentSlip.categoryId` so the database does not auto-delete slips. Reassignment handled at the API layer.

## 3. Icon Selection Strategy: Lucide React (Curated Subset)

- **Decision**: Provide a curated set of 24 Lucide React icon names as the icon picker options for categories.
- **Rationale**: Lucide React is already a listed dependency in `001-finance-manager`. Using it for the icon picker is consistent with the project's tooling and avoids introducing a new dependency. A curated subset (e.g., `Home`, `ShoppingCart`, `Zap`, `Car`, `Heart`, `Utensils`, `CreditCard`, `Briefcase`, `Plane`, `Dumbbell`, `GraduationCap`, `Music`, `Gift`, `Tv`, `Wifi`, `Coffee`, `Baby`, `Dog`, `Wrench`, `Landmark`, `Shirt`, `Pill`, `TreePine`, `Star`) maps well to common household spending categories.
- **Alternatives Considered**:
  - *Emoji picker*: Rejected — inconsistent rendering across platforms; doesn't match the app's premium dark-mode aesthetic.
  - *External icon library (Font Awesome)*: Rejected — unnecessary new dependency when Lucide React is already available.

## 4. Color Picker Strategy: Preset Palette + Hex Freeform

- **Decision**: Render 12 preset color swatches derived from the `globals.css` design token palette, plus a native HTML `<input type="color">` for freeform hex selection.
- **Rationale**: Keeps the color picker visually consistent with the app's existing palette (no third-party color picker library needed). The native color input covers edge cases where users want a custom color.
- **Alternatives Considered**:
  - *Third-party color picker (react-color)*: Rejected — adds a new dependency; the native input is sufficient.

## 5. Client-Side Search/Filter

- **Decision**: Implement category name filtering entirely on the client side using React state — no additional server request on each keystroke.
- **Rationale**: The spec (SC-005) requires filter results within 1 second with no page reload. Given the bounded list size (~50 categories max for a personal finance app), filtering a pre-loaded in-memory array is instantaneous and avoids round-trip latency.
- **Alternatives Considered**:
  - *Debounced server search*: Rejected — unnecessary round-trips for a small dataset.

## 6. API Layer: Next.js App Router Route Handlers

- **Decision**: Use Next.js App Router `route.ts` files at `src/app/api/categories/route.ts` (GET + POST) and `src/app/api/categories/[id]/route.ts` (PUT + DELETE).
- **Rationale**: Consistent with the pattern established in `001-finance-manager` for `slips/`, `achievements/`, and `stats/` routes. Uses the same `src/lib/prisma.ts` singleton for database access.
- **Alternatives Considered**:
  - *Server Actions*: Could work but adds complexity with form state management; REST route handlers are more explicit and testable.
