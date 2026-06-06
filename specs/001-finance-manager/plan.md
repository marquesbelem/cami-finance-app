# Implementation Plan: Gamified Personal Finance Manager

**Branch**: `001-finance-manager` | **Date**: 2026-06-06 | **Spec**: [/specs/001-finance-manager/spec.md](file:///d:/Projetos/cami-finance-app/specs/001-finance-manager/spec.md)

**Input**: Feature specification from `/specs/001-finance-manager/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary
The goal of this feature is to build a sleek, gamified personal finance manager using Next.js. The application will track payment slips (incorporating PDF/image uploads), categorize expenses, provide monthly filtering and visual dashboard analysis, and encourage savings via custom user-defined credit card spending achievements. Persistance is handled locally using SQLite database via Prisma ORM.

## Technical Context

**Language/Version**: Node.js (LTS), React 19, TypeScript/ES6+ JavaScript.

**Primary Dependencies**: Next.js (latest, App Router), Prisma ORM, Recharts (for dynamic graphs), Lucide React (for icons).

**Storage**: SQLite database (local file `dev.db` managed via Prisma).

**Testing**: Jest with React Testing Library, or Playwright for end-to-end user scenario validation.

**Target Platform**: Browser (desktop/mobile-responsive viewport), hosted on Node.js environment or Vercel.

**Project Type**: Next.js Web Application.

**Performance Goals**:
- Initial page rendering under 1.2 seconds.
- Client-side month filter transitions under 100ms.
- Dashboard animations rendering smoothly at 60 fps.

**Constraints**:
- Must be written in Vanilla CSS (prohibits Tailwind CSS).
- Persistent state across reloads/sessions.
- Single-user local workspace configuration (no auth/signup needed).

**Scale/Scope**: Local dashboard, up to a few thousand payment slips, custom achievements.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re check after Phase 1 design.*

| Principle | Spec Requirement Met? | Verification Details |
| :--- | :--- | :--- |
| **I. Premium & Dynamic UX** | Yes | Dark mode default theme, harmonious custom color variables, Google Fonts Outfit/Inter. No placeholders. |
| **II. Micro-Animations** | Yes | Smooth hover animations on cards, state-transition updates, and dynamic chart re-draws. |
| **III. Semantic HTML5 & Vanilla CSS**| Yes | Standard semantic layout elements (`<header>`, `<main>`, `<section>`). Strictly Vanilla CSS (CSS Modules). |
| **IV. Component-Driven Layout** | Yes | Component structure (`components/` directory) separating layout and presentational components (SlipList, DashboardCharts). |
| **V. SEO, Accessibility & Testability**| Yes | Unique form element IDs, high text contrast, descriptive page `<title>`, meta description, and single `<h1>`. |

## Project Structure

### Documentation (this feature)

```text
specs/001-finance-manager/
├── plan.md              # This file
├── research.md          # Phase 0 technical decisions
├── data-model.md        # Phase 1 SQLite database schema
├── quickstart.md        # Phase 1 verification and run scenarios
├── contracts/
│   └── api.md           # API contracts for slips, achievements, and stats
└── checklists/          # Checklists directory
```

### Source Code (repository root)

```text
prisma/
├── schema.prisma        # Database schema
└── dev.db               # SQLite database file (ignored in git)

public/
└── uploads/             # Directory to store uploaded slips (PDF/Images)

src/
├── app/                 # Next.js App Router (pages and APIs)
│   ├── api/             # API routes
│   │   ├── slips/       # CRUD operations for slips (GET, POST, PUT, DELETE)
│   │   ├── categories/  # GET for categories
│   │   ├── achievements/# GET, POST for achievements
│   │   └── stats/       # GET, PUT for user stats
│   ├── globals.css      # Core design variables (Harmony palette, Font imports)
│   ├── layout.tsx       # Main wrapper layout
│   └── page.tsx         # Dashboard main page
├── components/          # Reusable UI components
│   ├── AdicionarBoleto/ # Dialog form for creating slips
│   ├── SlipList/        # List of payment slips by month/category
│   ├── DashboardCharts/ # Recharts donut/bar chart component
│   └── Achievements/    # Achievements panel and user goals configurator
└── lib/                 # Database initialization and helpers
    ├── prisma.ts        # Prisma Client instance
    └── utils.ts         # Utility formatters (currency, dates)
```

**Structure Decision**: Next.js single project layout (Option 1). Database files inside `prisma/`, source logic under `src/app/` and `src/components/` with CSS Modules.

## Complexity Tracking

*No current violations of the repository constitution. Development will proceed directly to tasks setup.*
