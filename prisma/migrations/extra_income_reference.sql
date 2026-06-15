-- Migration: Add ExtraIncome table
-- Run via: npx prisma db push OR npx prisma migrate dev

CREATE TABLE "ExtraIncome" (
    "id"          TEXT      NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"      TEXT      NOT NULL,
    "amount"      FLOAT     NOT NULL,
    "description" TEXT      NOT NULL,
    "month"       TEXT      NOT NULL, -- Format: YYYY-MM
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
