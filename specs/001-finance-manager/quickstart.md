# Quickstart & Verification Guide: Gamified Personal Finance Manager

This document provides setup and verification instructions to test the implementation.

## Prerequisites
1. **Node.js** (LTS version)
2. **NPM** (v9+ or equivalent package manager)
3. **SQLite** (included natively or via node modules)

## Verification Scenarios

### Scenario 1: Setup and DB Initialization
Verify that database tables are successfully provisioned.

**Commands**:
```bash
# Install dependencies
npm install

# Run database migration (Prisma setup)
npx prisma db push
```

**Expected Outcome**:
- Success log from Prisma client generator.
- Database file `prisma/dev.db` is created.
- Default categories are pre-seeded in the database (e.g., Rent, Food, Utilities, Credit Card).

---

### Scenario 2: Create a Payment Slip with Attachment
Verify that payment slips can be added, and document file upload works.

**Steps**:
1. Run the server locally:
   ```bash
   npm run dev
   ```
2. Open the app in the browser: `http://localhost:3000`.
3. Fill out the "Adicionar Boleto" form:
   - **Title**: Electricity Bill
   - **Amount**: R$ 120,00
   - **Category**: Utilities
   - **Due Date**: 15/06/2026
   - **File**: (Attach a sample PDF or Image)
4. Click Save.

**Expected Outcome**:
- The new slip is displayed in the list under the "Utilities" category.
- The attachment is saved under `public/uploads/` directory.
- A "Download/View File" link is visible on the slip item.

---

### Scenario 3: Monthly Filtering
Verify that month selection filters the dashboard.

**Steps**:
1. Open dashboard.
2. Select "June 2026" from month selector.
3. Verify that only slips due/paid in June 2026 are included in the spending totals.

---

### Scenario 4: Achievement Logic Verification
Verify that credit card limit threshold warning or streak changes trigger.

**Steps**:
1. Set Monthly Credit Limit to R$ 500,00 in Settings.
2. Create custom achievement: "Card Saver" (keep card spending under 10% of limit).
3. Add a Credit Card slip of R$ 100,00 (20% of limit).
4. Verify achievements screen.

**Expected Outcome**:
- The "Card Saver" achievement progress bar shows it is incomplete or lost.
- UI triggers a warning or notification indicating the credit goal was violated.
