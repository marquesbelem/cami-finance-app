# Feature Specification: Gamified Personal Finance Manager

**Feature Branch**: `001-finance-manager`

**Created**: 2026-06-06

**Status**: Approved

**Input**: User description: "I am building a modern and gamefication personal manager finance website. I want it to look sleek and interective. Should have a CRUD to my payment slips by category. Should have a dashboard to filter per month. Should have a achivements to avoid use to much credit card. Should have a database."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Payment Slip Management (CRUD) (Priority: P1)
As a user, I want to create, view, update, and delete my payment slips, categorized by type (e.g., Rent, Food, Utilities, Credit Card), so that I can keep track of all my bills in one organized place.

**Why this priority**: It is the foundational CRUD requirement. Without payment slip tracking, there is no financial data to display on the dashboard or trigger achievements.

**Independent Test**: The user can navigate to the payments section, add a slip with an amount, due date, add bill document, and category, verify it appears in the list, edit its details, and delete it successfully.

**Acceptance Scenarios**:
1. **Given** the user is on the dashboard or payments page, **When** they click "Adicionar Boleto", fill in the form (Title: "Electricity Bill", Amount: "R$ 120,00", Category: "Utilities", Due Date: "15/06/2026") and save, **Then** the slip is added to the database and appears in the list under the "Utilities" category.
2. **Given** a listed payment slip, **When** the user edits its status to "Paid", **Then** the database updates, and the UI visually indicates it is paid (with a checked state or color shift) without reloading the page.
3. **Given** a listed payment slip, **When** the user clicks "Delete" and confirms, **Then** it is permanently deleted from the database and removed from the screen.
4. **Given** the user is creating or editing a payment slip, **When** they attach a bill document (PDF or image file) and save, **Then** the document is persisted in storage, linked to the slip, and can be viewed or downloaded from the slip details.

---

### User Story 2 - Monthly Dashboard & Analytics (Priority: P2)
As a user, I want a visual dashboard that summarizes my monthly spending, lets me filter transactions by month, and shows category-wise spending breakdowns so that I can analyze where my money is going.

**Why this priority**: Visual feedback is essential for a "sleek and interactive" experience, and the monthly filter is a requested core feature.

**Independent Test**: The user can select different months from a dropdown/selector and verify the charts and totals change to match only the slips for that month.

**Acceptance Scenarios**:
1. **Given** payment slips across multiple months, **When** the user selects "June 2026" on the month filter, **Then** only slips due or paid in June 2026 are included in the spending totals and shown in the breakdown chart.
2. **Given** the dashboard is loading, **When** it completes, **Then** the user is shown a clean, visually interactive chart (e.g., donut or bar chart) showing relative spending percentages by category.

---

### User Story 3 - Credit Card Savings Achievements (Priority: P3)
As a user, I want to unlock gamified achievements and view progress badges for keeping my credit card usage low, so that I am motivated to avoid overusing credit.

**Why this priority**: Implements the gamification requirement to incentivize better credit card habits.

**Independent Test**: The user can view an achievements panel showing unlocked and locked achievements and see progress meters updated when card transactions are recorded.

**Acceptance Scenarios**:
1. **Given** an achievement "Card Dieter" (keep credit card spending under 20% of total expenses this month), **When** the user logs payment slips such that card spending stays below 20%, **Then** the achievement badge is shown as unlocked or shows active progress.
2. **Given** a user has unlocked a new achievement, **When** they visit the dashboard, **Then** they are greeted with an interactive visual celebration (e.g., particle effects or toast notification).

### Edge Cases
- **Category Deletion**: What happens when a user deletes a category that contains active payment slips? (Assumption: Slips are moved to an "Uncategorized" system category rather than being deleted).
- **Overdue Payments**: How are overdue slips displayed? (System must visually flag overdue slips in a high-priority alarm state and show them at the top of the dashboard).
- **Negative Values or Zero**: What happens if a user inputs an amount of zero or a negative value? (Validation must prevent saving and show an error prompt).

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST support full CRUD operations for payment slips, including Title, Amount, Due Date, Category, and Status (Paid/Pending).
- **FR-002**: System MUST allow filtering of all payment slips and dashboard statistics by month.
- **FR-003**: System MUST calculate and display total monthly spending and category distribution percentages dynamically.
- **FR-004**: System MUST track credit card spending as a separate category or indicator.
- **FR-005**: System MUST compute and award achievements based on user-defined limits or automated thresholds for credit card usage.
- **FR-006**: System MUST persist all data (payment slips, categories, achievements, streaks) in a persistent database.
- **FR-007**: System MUST support a single-user workspace interface (no login/authentication screens required).
- **FR-008**: System MUST support custom achievement configurations, allowing users to define their own credit card spending goals, streaks, and milestone rules.
- **FR-009**: System MUST support attaching or uploading a bill document/file (e.g., PDF or image) to each payment slip.

### Key Entities
- **PaymentSlip**: Represents a bill or invoice. Attributes: ID, Title, Amount, Due Date, CategoryID, Status (Paid/Pending), IsCreditCardPayment (Boolean), DocumentPath (String, Optional), CreatedAt.
- **Category**: Represents a classification. Attributes: ID, Name, ColorCode, IconRef.
- **Achievement**: Represents a gamified reward. Attributes: ID, Title, Description, Type (e.g., Streak, Threshold), ConditionValue, IsUnlocked (Boolean), ProgressPercentage.
- **UserStats**: Represents tracking metrics. Attributes: ID, MonthlyBudgetLimit, TotalCreditLimit, CurrentStreakDays.

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: Users must be able to log a new payment slip in under 10 seconds.
- **SC-002**: When switching months, dashboard charts and metrics must update in under 150ms.
- **SC-003**: The gamification panel must immediately update progress bars and badge statuses upon adding or updating any payment slip.
- **SC-004**: System must retain 100% of data across application reloads, server restarts, or browser sessions.

## Assumptions
- The application will run as a client-server web app using modern web standards.
- A default list of basic categories (Rent, Utilities, Food, Leisure, Credit Card) will be pre-seeded.
- Single-user local experience is the default unless user authentication is specified.
- Responsive design is supported for mobile browsers.
