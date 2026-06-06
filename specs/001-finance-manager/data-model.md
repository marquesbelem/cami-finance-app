# Data Model: Gamified Personal Finance Manager

This document defines the schema for the SQLite database.

## Prisma Schema Representation

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model Category {
  id           String        @id @default(uuid())
  name         String        @unique
  colorCode    String        // CSS color variable or hex code
  iconRef      String        // Lucide icon name
  slips        PaymentSlip[]
}

model PaymentSlip {
  id                  String    @id @default(uuid())
  title               String
  amount              Float     // Payment amount in cents or standard decimal
  dueDate             DateTime
  status              String    // "Paid" or "Pending"
  isCreditCardPayment Boolean   @default(false)
  documentPath        String?   // Optional filesystem path to uploaded PDF/Image
  createdAt           DateTime  @default(now())
  
  categoryId          String
  category            Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
}

model Achievement {
  id                 String    @id @default(uuid())
  title              String    @unique
  description        String
  type               String    // "STREAK", "CARD_THRESHOLD", "SAVINGS"
  conditionValue     Float     // Threshold limit or target days
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

## Entity Relations
- **Category (1) <---> (N) PaymentSlip**: Deleting a category cascade-deletes or nullifies the associated slips.
- **UserStats (Singleton)**: Since the application is single-user, a single row in the `UserStats` table represents the current user's profile configuration.
