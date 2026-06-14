# Feature Specification: Due-Date Calendar View

**Feature Branch**: `003-calendar-view`

**Created**: 2026-06-06

**Status**: Draft

**Input**: User description: "i need the calendar that show the bills by dueDate"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Monthly Calendar with Bills (Priority: P1)

As a user, I want to open a monthly calendar page that shows each of my payment slips pinned to the day it is due, so that I can see at a glance which bills are coming up, which are overdue, and which have already been paid — all without navigating through lists.

**Why this priority**: The calendar is the primary value of this feature. Without it the other stories have no surface to live on, and it is the single most requested navigation pattern for personal finance apps: a date-based mental model for bill management.

**Independent Test**: The user can navigate to the calendar page, see the current month rendered as a full monthly grid, and find each existing payment slip displayed on the correct due-date cell — colour-coded by status (paid, pending, overdue).

**Acceptance Scenarios**:

1. **Given** the user has payment slips with various due dates in the current month, **When** they open the Calendar page, **Then** each slip appears on its correct day cell with its title, amount, and a status indicator (paid / pending / overdue).
2. **Given** a day has more than two slips due, **When** the user views that cell, **Then** a "+N more" overflow indicator is shown; clicking it reveals all slips for that day in an expanded panel or popover.
3. **Given** the user has no slips due in the current month, **When** they open the Calendar page, **Then** the calendar grid is still fully rendered with an empty-state message indicating no bills for this period, seems like a party or victory (gamification).
4. **Given** a slip is overdue (past due date and status is "Pending"), **When** it appears on the calendar, **Then** it is visually distinguished from paid and upcoming pending slips (e.g., distinct colour or icon).

---

### User Story 2 — Navigate Between Months (Priority: P1)

As a user, I want to move forward and backward through months on the calendar, so that I can plan ahead for next month's bills and review what I paid in previous months — without leaving the calendar view.

**Why this priority**: Month navigation is inseparable from the calendar itself; a single static month with no navigation delivers minimal value for financial planning.

**Independent Test**: From the Calendar page the user can click "Previous Month" and "Next Month" arrows, the calendar grid updates to show the correct month and year, and only slips due in that month are displayed.

**Acceptance Scenarios**:

1. **Given** the user is viewing June 2026, **When** they click "Next Month", **Then** the calendar updates to July 2026 and shows slips due in July.
2. **Given** the user has navigated several months forward, **When** they click "Today", **Then** the calendar returns to the current month and highlights today's date.
3. **Given** the user navigates to a month with no bills, **When** the month renders, **Then** an empty-state message is shown and the navigation controls remain active.

---

### User Story 3 — Inspect a Day's Bills (Priority: P2)

As a user, I want to click on any day cell and see a detail panel listing all bills due on that date — with their full title, category, amount, and status — so that I can quickly review or act on a specific day's obligations without leaving the calendar.

**Why this priority**: Day-level inspection transforms the calendar from a read-only view into an interactive planning tool. It is secondary to the calendar grid itself but significantly increases utility.

**Independent Test**: The user clicks on any day cell that has at least one slip pinned to it, a side panel or popover opens listing all slips for that day with their title, category colour, amount, and status badge. No navigation away from the calendar is required.

**Acceptance Scenarios**:

1. **Given** the user clicks a day cell with 3 slips, **When** the detail panel opens, **Then** all 3 slips are listed with title, category name and colour swatch, amount (formatted as BRL), and a paid/pending/overdue status badge by status order. (Pending -> Overdue -> Paid).
2. **Given** the user clicks an empty day cell, **When** the panel opens, **Then** it shows an empty-state message ("No bills due on this day") and an "Add bill" shortcut that opens the existing payment slip creation flow.
3. **Given** the detail panel is open, **When** the user presses Escape or clicks outside, **Then** the panel closes and the calendar remains visible.

---

### User Story 4 — Quick Status Toggle from Calendar (Priority: P3)

As a user, I want to mark a bill as paid or pending directly from the day-detail panel on the calendar, so that I can update my finances in context without navigating away to the main list.

**Why this priority**: Reduces friction for the most common action (marking a bill paid) during the bill-review workflow; lower priority because the main list already supports this.

**Independent Test**: From the day-detail panel, the user can click a "Mark as Paid" button on a pending slip; the slip's status badge updates to "Paid" immediately, and the calendar cell's visual indicator for that day also updates without a full page reload.

**Acceptance Scenarios**:

1. **Given** a pending slip is shown in the day-detail panel, **When** the user clicks "Mark as Paid", **Then** the slip's status changes to "Paid", the status badge in the panel updates, and the calendar cell's count/colour reflects the change.
2. **Given** a paid slip is shown in the panel, **When** the user clicks "Mark as Pending", **Then** the slip reverts to "Pending" and the calendar updates accordingly.
3. **Given** a status toggle is in progress, **When** the network is slow, **Then** the button shows a loading state and cannot be clicked again until the operation completes.

---

### Edge Cases

- **Bills on the last day of the month**: Slips due on the 28th, 29th, 30th, or 31st must appear in the correct cell even when the month has fewer days (e.g., February).
- **Multiple slips on the same day**: Cells must gracefully handle 1–10+ slips with an overflow indicator and without breaking the grid layout.
- **Month with zero bills**: Calendar still renders the full grid; an empty-state message is shown below or inside the grid.
- **Today's date highlighting**: The current day must be visually distinct (e.g., highlighted border) regardless of whether it has any bills.
- **Slips that span across months**: A slip's due date belongs to exactly one day; no spanning is needed, but slips due on the 1st of the next month must not appear in the current month's grid.
- **Very long bill titles**: Titles must be truncated within the day cell to prevent layout overflow.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a full monthly calendar grid (Sunday-to-Saturday or Monday-to-Sunday) showing all days of the selected month.
- **FR-002**: The system MUST pin each payment slip to the day cell matching its due date, displaying at minimum the slip title and a status indicator.
- **FR-003**: The system MUST visually distinguish between paid, pending, and overdue payment slips within each day cell.
- **FR-004**: The system MUST show a "+N more" overflow indicator on day cells containing more than two slips, and reveal all slips when the user interacts with the indicator.
- **FR-005**: The system MUST provide "Previous Month" and "Next Month" navigation controls that update the calendar grid without a full page reload.
- **FR-006**: The system MUST provide a "Today" shortcut that returns the calendar to the current month and highlights the current day's cell.
- **FR-007**: The system MUST highlight today's date cell visually regardless of bill content.
- **FR-008**: The system MUST open a day-detail panel when the user selects any day cell, listing all slips for that day with their title, category, amount, and status.
- **FR-009**: The system MUST allow the user to toggle a payment slip's status (Paid ↔ Pending) directly from the day-detail panel.
- **FR-010**: The system MUST display an empty-state message when the selected month has no payment slips due.
- **FR-011**: The system MUST display the calendar view as a new page accessible from the main navigation.
- **FR-012**: The system MUST show the month and year prominently in the calendar header.

### Key Entities *(include if feature involves data)*

- **PaymentSlip** *(existing)*: The primary data entity. The `dueDate` field determines calendar placement. `status` ("Paid" / "Pending") and `title`, `amount`, `category` are displayed in cells and the detail panel. No new fields are introduced.
- **CalendarMonth**: A derived view concept — not a stored entity — representing the set of days in a given year/month, used to group slips by `dueDate` for display.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The calendar page loads and renders the current month's bill grid in under 800 milliseconds on a standard connection.
- **SC-002**: Users can navigate from the current month to any adjacent month (previous or next) and see the updated calendar in under 300 milliseconds.
- **SC-003**: Users can open the day-detail panel for any date cell and see all slips for that day in under 200 milliseconds.
- **SC-004**: A status toggle (Paid ↔ Pending) from the day-detail panel is reflected in the calendar grid within 500 milliseconds of the user confirming the action.
- **SC-005**: Day cells with up to 10 slips display correctly without breaking the calendar layout on any supported screen size.
- **SC-006**: 100% of existing payment slips appear on the correct due-date cell after the feature is enabled — zero misplaced or missing bills.
- **SC-007**: The calendar is fully navigable using keyboard alone (Tab, arrow keys, Enter/Space to open detail panel).

---

## Assumptions

- The existing `PaymentSlip` entity already stores a `dueDate` field (DateTime); no schema changes are required to support calendar placement.
- The application is single-user; no multi-user access control or permission filtering is needed for the calendar view.
- The calendar displays bills from the existing data set; it does not introduce a new data entry flow (bill creation is handled by the existing "Adicionar Boleto" modal, which can be launched from the day-detail panel's empty state).
- The first day of the week defaults to Sunday; this can be treated as a display-only configuration if needed later.
- Mobile-responsive layout is required: the calendar must adapt to small screens (the grid may collapse to a week-list or condensed view on narrow viewports), but a dedicated mobile-native app is out of scope.
- The feature does not include calendar export (iCal, Google Calendar integration) — that is a future concern.
- Bills due on days outside the current month (leading/trailing days shown to complete the grid) may be displayed in a muted style but are not interactive.
