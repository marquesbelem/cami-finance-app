# Implementation Plan: Category Management (CRUD)

**Branch**: `002-category-crud` | **Date**: 2026-06-05 | **Spec**: [/specs/002-category-crud/spec.md](file:///d:/Projetos/cami-finance-app/specs/002-category-crud/spec.md)

**Input**: Feature specification from `/specs/002-category-crud/spec.md`

## Summary

This feature adds a full CRUD management page for spending categories in the Cami Finance App. It extends the `Category` model already specified in `001-finance-manager` by adding an `isSystemDefault` flag to protect built-in categories, then exposes full create/read/update/delete REST endpoints at `/api/categories`. On the frontend, a dedicated `/categories` page is added within the Next.js App Router, following the same component-driven, Vanilla CSS, dark-mode pattern established by the `001-finance-manager` plan.

## Technical Context

**Language/Version**: Node.js (LTS), React 19, TypeScript/ES6+ JavaScript.

**Primary Dependencies**: Next.js (latest, App Router), Prisma ORM (SQLite), Lucide React (icons), CSS Modules (Vanilla CSS).

**Storage**: SQLite database — same `prisma/dev.db` file used by `001-finance-manager`. This feature only extends the existing `Category` model; it does **not** introduce a new database file or ORM.

**Testing**: Jest with React Testing Library for component logic; manual scenario validation via the quickstart guide.

**Target Platform**: Browser (desktop/mobile-responsive), hosted on the same Node.js / Next.js environment as the main app.

**Project Type**: Next.js Web Application — single project, App Router.

**Performance Goals**:
- Category list page renders in under 500ms.
- All CRUD operations complete within 200ms on the server side.
- Client-side search/filter results appear within 1 second of typing (no page reload).

**Constraints**:
- Must be written in Vanilla CSS (CSS Modules); no Tailwind CSS.
- Reuse the existing Prisma Client singleton (`src/lib/prisma.ts`).
- Reuse the existing global design tokens from `src/app/globals.css`.
- System-default categories (`isSystemDefault: true`) must be blocked from deletion.
- All mutation endpoints must enforce data integrity rules (unique name, non-blank name).

**Scale/Scope**: Single-user local dashboard. Category list bounded to ~50 entries in the primary use case.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Met? | Verification Details |
| :--- | :--- | :--- |
| **I. Premium & Dynamic UX** | ✅ Yes | Category cards use the existing dark-mode palette and color swatches. Lucide icons used throughout. No placeholders. |
| **II. Micro-Animations** | ✅ Yes | Hover lift on category cards, slide-in animation on modal open, fade-out on delete confirmation. |
| **III. Semantic HTML5 & Vanilla CSS** | ✅ Yes | `<main>`, `<section>`, `<article>` for list layout. CSS Modules (`.module.css`) for all component styles, extending `globals.css` variables. |
| **IV. Component-Driven Layout** | ✅ Yes | New `CategoryList/`, `CategoryCard/`, `CategoryFormModal/` components under `src/components/`. Page router entry at `src/app/categories/page.tsx`. |
| **V. SEO, Accessibility & Testability** | ✅ Yes | `<h1>Gerenciar Categorias</h1>` unique per page, descriptive `<title>` tag, unique `id` attributes on all form inputs and action buttons. |

*Post-Phase 1 re-check: No violations detected.*

## Project Structure

### Documentation (this feature)

```text
specs/002-category-crud/
├── plan.md              # This file
├── research.md          # Phase 0 technical decisions
├── data-model.md        # Phase 1 updated Prisma schema
├── quickstart.md        # Phase 1 verification and run scenarios
├── contracts/
│   └── api.md           # API contracts for categories CRUD
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
prisma/
├── schema.prisma        # MODIFIED: Category model extended with isSystemDefault field
└── dev.db               # SQLite database file (unchanged, re-migrated)

src/
├── app/
│   ├── api/
│   │   └── categories/
│   │       ├── route.ts          # NEW: GET (list all) + POST (create)
│   │       └── [id]/
│   │           └── route.ts      # NEW: PUT (update) + DELETE (with slip reassignment)
│   ├── categories/
│   │   └── page.tsx              # NEW: Category Management page (App Router)
│   ├── globals.css               # UNCHANGED: Existing design tokens reused
│   └── layout.tsx                # MODIFIED: Add "Categorias" link to main navigation
├── components/
│   ├── CategoryList/
│   │   ├── CategoryList.tsx      # NEW: Renders list or empty-state; handles search filter
│   │   └── CategoryList.module.css
│   ├── CategoryCard/
│   │   ├── CategoryCard.tsx      # NEW: Single category card with name, color swatch, icon, slip count, edit/delete actions
│   │   └── CategoryCard.module.css
│   └── CategoryFormModal/
│       ├── CategoryFormModal.tsx # NEW: Create/Edit modal with name input, color picker, icon picker, validation
│       └── CategoryFormModal.module.css
└── lib/
    ├── prisma.ts                 # UNCHANGED: Reused Prisma Client singleton
    └── utils.ts                  # UNCHANGED: Reused utility formatters
```

**Structure Decision**: Follows the same single Next.js project layout (Option 1) established in `001-finance-manager`. New source code lives inside the existing `src/app/` and `src/components/` directories with no new top-level directories or packages.

## Complexity Tracking

*No current violations of the repository constitution. No additional complexity introduced.*
