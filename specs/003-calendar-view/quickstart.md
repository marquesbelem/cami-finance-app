# Quickstart: Due-Date Calendar View (003-calendar-view)

## Prerequisites

- Dev server running: `npm run dev` (port 3000)
- At least one `PaymentSlip` record in the database with `dueDate` in the current month
- Database seeded: `npm run db:seed` (if starting fresh)

---

## Validation Scenarios

### SC-001 — Calendar loads in < 800 ms

1. Open DevTools → Network tab → set throttle to "Fast 3G"
2. Navigate to `http://localhost:3000/calendar`
3. **Expected**: The full monthly grid renders within 800 ms of navigation (measure from `DOMContentLoaded`)
4. **Check**: All slips for the current month appear on their correct due-date cells

---

### SC-002 — Month navigation in < 300 ms

1. Navigate to `http://localhost:3000/calendar`
2. Open DevTools → Performance tab → start recording
3. Click the "→ Próximo mês" (Next Month) button
4. **Expected**: Calendar grid updates to the next month within 300 ms; stale month remains visible during fetch (no blank flash)
5. **Check**: Month label in header updates to the correct month/year

---

### SC-003 — Day-detail panel opens in < 200 ms

1. On the calendar page, click any day cell that has at least one slip
2. **Expected**: Slide-in detail panel appears within 200 ms
3. **Check**: Panel lists all slips for that day with title, category swatch, amount (R$ format), and status badge

---

### SC-004 — Status toggle reflects in < 500 ms

1. Open the day-detail panel for a day with a "Pending" slip
2. Click "Marcar como Pago" on that slip
3. **Expected**: 
   - Status badge in panel changes to "Paid" immediately (optimistic, < 16 ms)
   - Calendar cell colour-coding updates immediately
   - Server confirmation arrives within 500 ms (check Network tab)

---

### US1-1 — Slips appear on correct due-date cells

1. Navigate to `http://localhost:3000/calendar`
2. Note the `dueDate` of a known slip (e.g., June 15)
3. **Expected**: That slip appears in the cell for day 15, showing its title and a coloured status chip

---

### US1-2 — "+N more" overflow

1. Create 3+ slips due on the same day (use "Adicionar Boleto" modal)
2. Navigate to the calendar
3. **Expected**: The day cell shows 2 slips and a "+N more" button
4. Click "+N more" → **Expected**: Day-detail panel opens listing all slips for that day

---

### US1-3 — Empty month gamification

1. Navigate to a month with no slips (use month navigation to go far into the future)
2. **Expected**: Calendar grid still renders fully; an empty-state celebration message appears (e.g., 🎉 "Nenhum boleto este mês — boa festa!")

---

### US2-2 — "Today" shortcut

1. Navigate 3 months forward
2. Click "Hoje" button
3. **Expected**: Calendar returns to current month; today's date cell is visually highlighted (distinct border/background)

---

### US3-3 — Escape closes panel

1. Open the day-detail panel
2. Press `Escape`
3. **Expected**: Panel closes; calendar remains visible

---

### US3-2 — Empty day cell → "Add bill" shortcut

1. Click on any empty day cell
2. **Expected**: Day-detail panel opens with empty state + "Adicionar Boleto" shortcut button
3. Click the shortcut → **Expected**: The existing `AdicionarBoleto` modal opens with `dueDate` pre-filled to the selected day

---

### EDGE-1 — Today highlighted always

1. Navigate to the current month
2. **Expected**: Today's cell has a distinct visual treatment (glowing border, brand accent) even if it has no slips

---

### SC-007 — Full keyboard navigation

1. Navigate to `http://localhost:3000/calendar`
2. Press `Tab` until a day cell is focused
3. Use `Arrow Left/Right/Up/Down` to move between day cells
4. Press `Enter` or `Space` on a day cell with slips
5. **Expected**: Day-detail panel opens
6. Press `Escape`
7. **Expected**: Panel closes; focus returns to the triggering cell

---

## References

- Data model: [data-model.md](./data-model.md)
- API contracts: [contracts/calendar-api.md](./contracts/calendar-api.md)
- Full spec: [spec.md](./spec.md)
