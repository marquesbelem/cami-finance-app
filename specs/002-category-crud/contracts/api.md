# API Contracts: Category Management (CRUD)

All endpoints are hosted relative to the app base URL (e.g., `http://localhost:3000`). This document extends [001-finance-manager/contracts/api.md](../../001-finance-manager/contracts/api.md) — the `GET /api/categories` stub defined there is now replaced by the full CRUD surface defined below.

---

## Categories CRUD

### GET `/api/categories`

- **Description**: Retrieve all categories, including the count of linked payment slips per category.
- **Query Parameters**: None
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "cat-uuid-1",
      "name": "Utilities",
      "colorCode": "#3b82f6",
      "iconRef": "Zap",
      "isSystemDefault": true,
      "createdAt": "2026-06-05T00:00:00.000Z",
      "_count": { "slips": 3 }
    },
    {
      "id": "cat-uuid-2",
      "name": "Transport",
      "colorCode": "#14b8a6",
      "iconRef": "Car",
      "isSystemDefault": false,
      "createdAt": "2026-06-05T12:34:56.000Z",
      "_count": { "slips": 0 }
    }
  ]
  ```

---

### POST `/api/categories`

- **Description**: Create a new category.
- **Request Body** (`application/json`):
  ```json
  {
    "name": "Transport",
    "colorCode": "#14b8a6",
    "iconRef": "Car"
  }
  ```
- **Validation Rules**:
  - `name`: Required, non-empty string, max 50 characters, case-insensitively unique across existing categories.
  - `colorCode`: Required, valid hex color string (e.g., `#rrggbb`).
  - `iconRef`: Required, must be a valid Lucide icon name from the curated set.
- **Response**: `201 Created`
  ```json
  {
    "id": "cat-uuid-new",
    "name": "Transport",
    "colorCode": "#14b8a6",
    "iconRef": "Car",
    "isSystemDefault": false,
    "createdAt": "2026-06-05T14:00:00.000Z",
    "_count": { "slips": 0 }
  }
  ```
- **Error Responses**:
  - `400 Bad Request` — blank name or name exceeding 50 chars:
    ```json
    { "error": "Category name is required and must be 50 characters or fewer." }
    ```
  - `409 Conflict` — duplicate name:
    ```json
    { "error": "A category with this name already exists." }
    ```

---

### PUT `/api/categories/[id]`

- **Description**: Update the name, color, or icon of an existing category. System default categories can be edited (name/color/icon may be updated, but `isSystemDefault` cannot be changed via the API).
- **Request Body** (`application/json`, all fields optional but at least one required):
  ```json
  {
    "name": "Entertainment",
    "colorCode": "#8b5cf6",
    "iconRef": "Tv"
  }
  ```
- **Validation Rules**: Same as POST for each provided field.
- **Response**: `200 OK` with updated category object (same shape as GET response item).
- **Error Responses**:
  - `404 Not Found` — category ID does not exist:
    ```json
    { "error": "Category not found." }
    ```
  - `400 Bad Request` — validation failure (same format as POST).
  - `409 Conflict` — duplicate name conflict with another category.

---

### DELETE `/api/categories/[id]`

- **Description**: Delete a category. All payment slips currently linked to this category are automatically reassigned to the system "Uncategorized" category. This operation is atomic (Prisma transaction).
- **Response**: `204 No Content` on success.
- **Error Responses**:
  - `403 Forbidden` — attempt to delete a system-default category:
    ```json
    { "error": "System default categories cannot be deleted." }
    ```
  - `404 Not Found` — category ID does not exist:
    ```json
    { "error": "Category not found." }
    ```

---

## Validation Summary

| Field | Rule | Error Code |
|-------|------|------------|
| `name` | Required, non-empty, max 50 chars | `400` |
| `name` | Case-insensitively unique | `409` |
| `colorCode` | Required, valid `#rrggbb` hex string | `400` |
| `iconRef` | Required, must be from curated Lucide icon list | `400` |
| `isSystemDefault` | Not writable via API (read-only after seeding) | — |
| DELETE target | Cannot be `isSystemDefault: true` | `403` |
