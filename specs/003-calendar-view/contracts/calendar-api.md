# API Contract: Calendar View (003-calendar-view)

## Existing Endpoints (used by calendar, no changes needed)

---

### GET /api/slips

Fetch payment slips, optionally filtered by month.

**Request**

```
GET /api/slips?month=YYYY-MM
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `month` | `string` (YYYY-MM) | No | Filters slips to the given calendar month |

**Response** `200 OK`

```json
[
  {
    "id": "uuid",
    "title": "Aluguel",
    "amount": 1200.00,
    "dueDate": "2026-06-10T00:00:00.000Z",
    "status": "Pending",
    "isCreditCardPayment": false,
    "documentPath": null,
    "createdAt": "2026-06-01T10:00:00.000Z",
    "categoryId": "uuid",
    "category": {
      "id": "uuid",
      "name": "Aluguel",
      "colorCode": "#7C5CFC",
      "iconRef": "Home",
      "isSystemDefault": true,
      "createdAt": "2026-06-01T00:00:00.000Z"
    }
  }
]
```

**Calendar usage**: Called with `?month=YYYY-MM` on every month navigation. Response is grouped client-side by `dueDate.slice(0, 10)` into a `Map<string, Slip[]>`.

**Error** `500` — `{ "error": "Failed to fetch slips" }`

---

### PUT /api/slips/:id

Update a payment slip's status (used by the status toggle in the day-detail panel).

**Request**

```
PUT /api/slips/:id
Content-Type: multipart/form-data

status=Paid   (or "Pending")
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `"Paid" \| "Pending"` | Yes | New status value |

**Response** `200 OK` — Returns the updated `PaymentSlip` object (same shape as GET).

**Calendar usage**: Called after optimistic UI update. On `200`, response is used to confirm the local state. On error, local state is rolled back.

**Error** `400` — `{ "error": "..." }` / `404` — `{ "error": "Slip not found" }` / `500`

---

## New Endpoints

**None.** The calendar feature is fully served by the existing `/api/slips` endpoints. No new API routes are required.

---

## UI Component Contracts

### CalendarGrid

```ts
interface CalendarGridProps {
  calendarMonth: CalendarMonth;           // Pre-computed month view model
  selectedDay: string | null;             // "YYYY-MM-DD" of selected day
  onDaySelect: (day: string) => void;     // Opens day-detail panel
  isPending: boolean;                     // useTransition pending state
}
```

### DayCell

```ts
interface DayCellProps {
  day: CalendarDay;
  isSelected: boolean;
  onSelect: (dateKey: string) => void;    // "YYYY-MM-DD"
  tabIndex: number;                       // For keyboard navigation
}
```

### DayDetailPanel

```ts
interface DayDetailPanelProps {
  dateKey: string | null;                 // "YYYY-MM-DD" or null (closed)
  slips: SlipWithStatus[];
  onClose: () => void;
  onStatusToggle: (slip: Slip) => Promise<void>;
  onAddBill: () => void;                  // Opens AdicionarBoleto modal
}
```

### CalendarHeader

```ts
interface CalendarHeaderProps {
  label: string;                          // "junho de 2026"
  isPending: boolean;                     // Transition in progress
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}
```
