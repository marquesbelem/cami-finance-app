# API Contracts: Gamified Personal Finance Manager

All API endpoints are hosted relative to the base URL (e.g., `/api`).

## 1. Payment Slips CRUD

### GET `/api/slips`
- **Description**: Retrieve list of payment slips, filterable by month.
- **Query Parameters**:
  - `month` (Optional): Format `YYYY-MM` (e.g. `2026-06`)
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "uuid-1",
      "title": "Electricity Bill",
      "amount": 120.0,
      "dueDate": "2026-06-15T00:00:00.000Z",
      "status": "Pending",
      "isCreditCardPayment": false,
      "documentPath": "/uploads/uuid-1-invoice.pdf",
      "categoryId": "cat-uuid"
    }
  ]
  ```

### POST `/api/slips`
- **Description**: Add a new payment slip.
- **Request Body (Multipart Form Data)**:
  - `title` (String, Required)
  - `amount` (Float, Required)
  - `dueDate` (String, Required)
  - `status` (String, Required: "Paid" or "Pending")
  - `isCreditCardPayment` (Boolean, Required)
  - `categoryId` (String, Required)
  - `document` (File, Optional - PDF or Image)
- **Response**: `201 Created`
  ```json
  {
    "id": "uuid-new",
    "title": "Electricity Bill",
    "amount": 120.0,
    "dueDate": "2026-06-15T00:00:00.000Z",
    "status": "Pending",
    "isCreditCardPayment": false,
    "documentPath": "/uploads/uuid-new-invoice.pdf",
    "categoryId": "cat-uuid"
  }
  ```

### PUT `/api/slips/[id]`
- **Description**: Update an existing payment slip.
- **Request Body (Multipart Form Data)**: Same fields as POST (all optional)
- **Response**: `200 OK` with updated object.

### DELETE `/api/slips/[id]`
- **Description**: Delete a payment slip.
- **Response**: `204 No Content`

---

## 2. Categories

### GET `/api/categories`
- **Description**: Retrieve all payment categories.
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "cat-uuid",
      "name": "Utilities",
      "colorCode": "var(--color-utilities)",
      "iconRef": "Zap"
    }
  ]
  ```

---

## 3. Achievements

### GET `/api/achievements`
- **Description**: Retrieve all achievements, progress, and unlock statuses.
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "ach-uuid",
      "title": "Card Dieter",
      "description": "Keep credit card spending under 20% of total expenses this month",
      "type": "CARD_THRESHOLD",
      "conditionValue": 20.0,
      "isUnlocked": true,
      "progressPercentage": 100.0,
      "unlockedAt": "2026-06-05T20:00:00.000Z"
    }
  ]
  ```

### POST `/api/achievements`
- **Description**: Create a custom user-defined achievement.
- **Request Body**:
  ```json
  {
    "title": "Custom Goal",
    "description": "Don't use credit card at all this week",
    "type": "STREAK",
    "conditionValue": 7.0
  }
  ```
- **Response**: `201 Created`

---

## 4. User Stats

### GET `/api/stats`
- **Description**: Get current user statistics and limits.
- **Response**: `200 OK`
  ```json
  {
    "monthlyBudgetLimit": 2000.0,
    "totalCreditLimit": 1000.0,
    "currentStreakDays": 5
  }
  ```

### PUT `/api/stats`
- **Description**: Update budget limits or credit limits.
- **Request Body**:
  ```json
  {
    "monthlyBudgetLimit": 2500.0,
    "totalCreditLimit": 800.0
  }
  ```
- **Response**: `200 OK`
