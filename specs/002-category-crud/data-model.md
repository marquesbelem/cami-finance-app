# Data Model: Category Management (CRUD)

This document defines the schema changes required to support full CRUD for categories. It extends the model established in [001-finance-manager/data-model.md](../../001-finance-manager/data-model.md).

## Changes to Prisma Schema

### Modified Model: `Category`

Added `isSystemDefault` boolean flag to protect built-in categories from deletion.

```prisma
model Category {
  id              String        @id @default(uuid())
  name            String        @unique
  colorCode       String        // Hex color code (e.g., "#4ade80") or CSS variable name
  iconRef         String        // Lucide React icon name (e.g., "Zap", "ShoppingCart")
  isSystemDefault Boolean       @default(false)  // NEW: protects seed categories from deletion
  createdAt       DateTime      @default(now())  // NEW: audit timestamp
  slips           PaymentSlip[]
}
```

### Modified Relation: `PaymentSlip.categoryId`

Changed `onDelete` behaviour from `Cascade` (which would delete slips) to `Restrict` (which blocks deletion at the DB level). Reassignment to "Uncategorized" is handled by the API layer in a Prisma transaction before deleting the category.

```prisma
model PaymentSlip {
  id                  String    @id @default(uuid())
  title               String
  amount              Float
  dueDate             DateTime
  status              String    // "Paid" | "Pending"
  isCreditCardPayment Boolean   @default(false)
  documentPath        String?
  createdAt           DateTime  @default(now())

  categoryId          String
  category            Category  @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  //                                                                                  ^-- CHANGED from Cascade
}
```

> **Migration note**: Run `npx prisma migrate dev --name add-category-system-default` after updating the schema. The seed script must mark the 5 built-in categories (`Rent`, `Utilities`, `Food`, `Leisure`, `Credit Card`, `Uncategorized`) with `isSystemDefault: true`.

## Full Updated Schema (for reference)

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model Category {
  id              String        @id @default(uuid())
  name            String        @unique
  colorCode       String
  iconRef         String
  isSystemDefault Boolean       @default(false)
  createdAt       DateTime      @default(now())
  slips           PaymentSlip[]
}

model PaymentSlip {
  id                  String    @id @default(uuid())
  title               String
  amount              Float
  dueDate             DateTime
  status              String
  isCreditCardPayment Boolean   @default(false)
  documentPath        String?
  createdAt           DateTime  @default(now())

  categoryId          String
  category            Category  @relation(fields: [categoryId], references: [id], onDelete: Restrict)
}

model Achievement {
  id                 String    @id @default(uuid())
  title              String    @unique
  description        String
  type               String
  conditionValue     Float
  isUnlocked         Boolean   @default(false)
  progressPercentage Float     @default(0.0)
  unlockedAt         DateTime?
}

model UserStats {
  id                 String    @id @default("singleton")
  monthlyBudgetLimit Float     @default(2000.0)
  totalCreditLimit   Float     @default(1000.0)
  currentStreakDays  Int       @default(0)
}
```

## Seed Data (System Default Categories)

The Prisma seed file (`prisma/seed.ts`) must upsert the following categories with `isSystemDefault: true`:

| Name | colorCode | iconRef | isSystemDefault |
|------|-----------|---------|-----------------|
| Uncategorized | `#6b7280` | `FolderOpen` | `true` |
| Rent | `#f59e0b` | `Home` | `true` |
| Utilities | `#3b82f6` | `Zap` | `true` |
| Food | `#10b981` | `Utensils` | `true` |
| Leisure | `#8b5cf6` | `Music` | `true` |
| Credit Card | `#ef4444` | `CreditCard` | `true` |

## Entity Relations

- **Category (1) ←→ (N) PaymentSlip**: A category has many payment slips. Deleting a category is blocked at the DB level (`Restrict`); the API must first reassign all linked slips to the "Uncategorized" category in a transaction, then delete the category.
- **System Default categories** (`isSystemDefault: true`): Cannot be deleted by the user. The DELETE endpoint returns `403 Forbidden` if the target category has `isSystemDefault: true`.
