# Implementation Plan: Persistent Database Migration & Multi-User Support

**Branch**: `004-persistent-db-migration` | **Date**: 2026-06-12 | **Spec**: [specs/004-persistent-db-migration/spec.md](file:///d:/Projetos/cami-finance-app/specs/004-persistent-db-migration/spec.md)

**Input**: Feature specification from `specs/004-persistent-db-migration/spec.md`

## Summary

Migrate the Cami Finance App from a local SQLite file database to a cloud-hosted Supabase (PostgreSQL) database. To allow sharing the web app safely without complex OAuth setups, we will introduce a simple client-side welcome/login gate that maps all data (categories, payment slips, achievements, stats) to a `User` model. Additionally, we will refactor all raw status strings to a strict database-level enum (`PAGO`, `PENDENTE`).

## Technical Context

- **Language/Version**: TypeScript, Node.js (v20+), React 19, Next.js 16.2.7 (App Router)
- **Primary Dependencies**: `@prisma/client` ^6.9.0, `prisma` ^6.9.0, `ts-node` ^10.9.2
- **Storage**: Supabase PostgreSQL (production) with dynamic fallback / local connection pooled settings
- **Testing**: Manual verification, network devtools inspection, Prisma Studio
- **Target Platform**: Desktop and mobile web browsers (responsive layout verified at 500x751 viewports)
- **Project Type**: Next.js Full-Stack Web Application
- **Performance Goals**: API response times under 400ms, client gate load under 200ms
- **Constraints**: Zero data loss for existing entries during migration, no persistent local files (ephemeral storage friendly)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Premium UI/UX)**: The user identification screen must match the Outfit/Inter display typography, use modern, dark-mode CSS custom variables, and include sleek input borders and interactive hover transitions.
- **Principle III (Vanilla CSS)**: All styling for the Welcome screen must be written in Vanilla CSS within module files. No Tailwind CSS or component libraries.
- **Principle IV (Responsive Architecture)**: The Welcome screen must be mobile-first and adapt seamlessly to small screens like 500x751 viewports.
- **Principle V (Accessibility & Testability)**: Inputs and buttons must have high contrast, proper labels, and unique HTML IDs (`login-username-input`, `login-submit-button`).

## Project Structure

### Documentation (this feature)

```text
specs/004-persistent-db-migration/
├── spec.md              # Feature specification
├── plan.md              # This file (Technical Implementation Plan)
├── research.md          # Phase 0: SQLite vs Postgres migration details
├── data-model.md        # Phase 1: Database models and relations
├── quickstart.md        # Phase 1: Verification guide and steps
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code changes

```text
prisma/
├── schema.prisma        # [MODIFY] Change provider to postgresql, add User model, enum SlipStatus
├── export.ts            # [NEW] Utility to export SQLite data to JSON
├── import.ts            # [NEW] Utility to import JSON data to Supabase Postgres
├── dev.db               # SQLite database (to be migrated/abandoned after successful import)
src/
├── app/
│   ├── layout.tsx       # [MODIFY] Wrap app in AuthProvider
│   ├── page.tsx         # [MODIFY] Refactor status filters/toggles to PT/BR enums
│   ├── api/
│   │   ├── auth/
│   │   │   └── route.ts # [NEW] Simple username registration/login endpoint
│   │   ├── slips/
│   │   │   ├── route.ts # [MODIFY] Scope GET/POST by x-user-id header, use PAGO/PENDENTE
│   │   │   └── [id]/
│   │   │       └── route.ts # [MODIFY] Scope PUT/DELETE by x-user-id, use PAGO/PENDENTE
│   │   ├── categories/  # [MODIFY] Scope categories GET/POST/DELETE to current user/defaults
│   │   ├── stats/       # [MODIFY] Scope stats GET/PUT to user ID
│   │   └── achievements/# [MODIFY] Scope achievements GET/PUT to user ID
│   └── calendar/
│       └── page.tsx     # [MODIFY] Refactor status to PAGO/PENDENTE enums
├── components/
│   ├── AuthProvider/
│   │   ├── AuthProvider.tsx # [NEW] Session check, login view, and global fetch header interceptor
│   │   └── AuthProvider.module.css # [NEW] CSS module for the welcome identification gate
│   ├── AdicionarBoleto/
│   │   └── AdicionarBoleto.tsx  # [MODIFY] Update status options to PAGO and PENDENTE
│   ├── SlipList/
│   │   └── SlipItem.tsx # [MODIFY] Map SlipStatus to view indicators
│   └── DashboardCharts/
│       ├── DashboardCharts.tsx # [MODIFY] Refactor charts status mapping
│       └── SummaryCards.tsx    # [MODIFY] Update counts and calculations
└── lib/
    ├── calendar.ts      # [MODIFY] Update helper types and status logic
    └── achievements.ts  # [MODIFY] Calculate streaks scoped per user
```

**Structure Decision**: Standard single project. Config and prisma logic updated directly in root `prisma/`, component architecture nested cleanly within `src/components/` and `src/app/`.
