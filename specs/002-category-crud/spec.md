# Feature Specification: Category Management (CRUD)

**Feature Branch**: `002-category-crud`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "add CRUD page to category"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a New Category (Priority: P1)

As a user, I want to create a new spending category (e.g., "Transport", "Health") with a custom name, color, and icon, so that I can organize my payment slips with labels that match my personal financial habits.

**Why this priority**: The Category entity is a dependency for Payment Slips. Without the ability to create categories, users cannot properly classify their bills, making the whole organizational system unusable.

**Independent Test**: The user can open the Category Management page, click "Adicionar Categoria", fill in a name, choose a color from a color picker, select an icon from an icon set, save it, and see the new category immediately appear in the category list.

**Acceptance Scenarios**:

1. **Given** the user is on the Category Management page, **When** they click "Adicionar Categoria", fill in the name "Transport", pick a teal color, choose a car icon, and confirm, **Then** the new category is saved and appears in the category list with the chosen name, color swatch, and icon.
2. **Given** the user tries to save a category with a blank name, **When** they click save, **Then** the system shows an inline validation error ("Category name is required") and does not save the entry.
3. **Given** the user tries to save a category with a name that already exists, **When** they click save, **Then** the system shows a duplicate-name error and does not create a second entry.

---

### User Story 2 - View All Categories (Priority: P1)

As a user, I want to see a visually rich list of all my categories — displaying each one's name, color, icon, and the count of associated payment slips — so that I can quickly understand my financial classification landscape at a glance.

**Why this priority**: The listing view is the entry point to all other category operations. It must exist before edit or delete actions are accessible.

**Independent Test**: The user can navigate to the Category Management page and see all saved categories displayed as styled cards or rows with their names, colors, icons, and slip counts, without requiring any other action.

**Acceptance Scenarios**:

1. **Given** the app has 5 existing categories, **When** the user navigates to the Category Management page, **Then** all 5 categories are rendered with their names, color swatches, icons, and the number of payment slips associated with each.
2. **Given** no categories exist yet, **When** the user opens the Category Management page, **Then** an empty-state illustration and a prominent "Create your first category" call-to-action are displayed.
3. **Given** the category list has more than 10 categories, **When** the page loads, **Then** the list remains scrollable or paginated, and search/filter capabilities allow the user to find a category by name in under 2 seconds.

---

### User Story 3 - Edit an Existing Category (Priority: P2)

As a user, I want to edit the name, color, or icon of an existing category so that I can correct mistakes or refine my organization without losing the payment slips already associated with that category.

**Why this priority**: Edits are essential for long-term usability but not required for initial data entry. Pre-existing payment slips must remain linked after an edit.

**Independent Test**: The user can click an "Edit" action on any category card, change the name from "Leisure" to "Entertainment", change the color, save, and see the updated information reflected in the list — all without any payment slip losing its category link.

**Acceptance Scenarios**:

1. **Given** a category named "Leisure" with 3 linked payment slips, **When** the user edits its name to "Entertainment" and saves, **Then** the category list shows "Entertainment" and all 3 payment slips remain linked under the new name.
2. **Given** the user opens the edit form for a category, **When** they change only the color and save, **Then** all other fields (name, icon) remain unchanged, and the new color is reflected across all UI elements that reference this category.

---

### User Story 4 - Delete a Category (Priority: P3)

As a user, I want to delete a category I no longer need, with a clear confirmation step and an automated safety rule for any payment slips currently linked to that category, so that I can keep my list clean without accidentally orphaning data.

**Why this priority**: Deletion is a destructive action and lowest priority. The safety mechanism (migrating slips to "Uncategorized") ensures no financial data is lost.

**Independent Test**: The user can delete a category that has linked slips, confirm the action in a dialog that explains slips will be moved to "Uncategorized", and verify the category is removed while the slips remain accessible under "Uncategorized".

**Acceptance Scenarios**:

1. **Given** a category "Utilities" with 2 linked payment slips, **When** the user clicks "Delete" and confirms the action in the warning dialog, **Then** the "Utilities" category is permanently removed and its 2 slips are automatically re-assigned to the system "Uncategorized" category.
2. **Given** a category with no linked slips, **When** the user clicks "Delete" and confirms, **Then** the category is removed immediately with no secondary warning about data migration.
3. **Given** the user clicks "Delete" on a category, **When** the confirmation dialog appears, **Then** the user can click "Cancel" to abort the deletion, leaving the category unchanged.
4. **Given** the system "Uncategorized" category, **When** the user attempts to delete it, **Then** the system blocks deletion and shows a message that system-default categories cannot be removed.

---

### Edge Cases

- **Duplicate Category Name**: What happens if the user creates a category with the same name as an existing one? (System must reject it with a validation error — names must be unique, case-insensitive.)
- **Deleting a Category in Use**: What happens if a category has payment slips when deleted? (Slips are automatically reassigned to the system "Uncategorized" category; no financial data is lost.)
- **System Default Categories**: What happens if the user tries to delete a pre-seeded system default category (e.g., "Uncategorized")? (System must block deletion of protected system categories.)
- **Very Long Category Names**: What happens if a name exceeds a reasonable display length? (System must enforce a maximum character limit of 50 characters and show a counter as the user types.)
- **Empty State on Filter/Search**: What happens when a search query returns no results? (Display a friendly empty-state message with a suggestion to clear the search.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create a new category with a required name (max 50 characters), a color selection, and an icon selection.
- **FR-002**: System MUST display all categories in a visually rich list, showing each category's name, color, icon, and the count of associated payment slips.
- **FR-003**: System MUST allow users to edit any field (name, color, icon) of an existing category without affecting linked payment slips.
- **FR-004**: System MUST allow users to delete a category, and upon confirmation, automatically reassign all linked payment slips to the system "Uncategorized" category.
- **FR-005**: System MUST prevent saving a category with a duplicate name (case-insensitive) and display a clear validation error.
- **FR-006**: System MUST prevent saving a category with an empty name and display a clear inline validation error.
- **FR-007**: System MUST prevent deletion of system-default protected categories (e.g., "Uncategorized", "Credit Card") and inform the user why.
- **FR-008**: System MUST display a confirmation dialog before any delete action, clearly stating that linked slips will be moved to "Uncategorized".
- **FR-009**: System MUST display an empty-state message with a call-to-action when no categories exist.
- **FR-010**: System MUST provide a search/filter input to locate categories by name when the list contains more than 10 entries.
- **FR-011**: System MUST persist all category changes (create, edit, delete) immediately to the database with no data loss on page reload.

### Key Entities

- **Category**: The primary entity managed on this page. Attributes: ID (system-generated), Name (string, required, unique, max 50 chars), ColorCode (hex color string), IconRef (string referencing an icon identifier), IsSystemDefault (boolean, prevents deletion), CreatedAt (timestamp).
- **PaymentSlip** *(referenced entity)*: Each PaymentSlip holds a CategoryID. When a category is deleted, all associated PaymentSlip records have their CategoryID updated to the "Uncategorized" system category ID.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new category in under 15 seconds from clicking "Add Category" to seeing it appear in the list.
- **SC-002**: Users can edit a category's name and color in under 10 seconds.
- **SC-003**: Deleting a category with a confirmation step takes no more than 3 user interactions (click delete → confirm dialog → confirm button).
- **SC-004**: The category list with up to 50 entries loads and renders in under 500 milliseconds.
- **SC-005**: Search/filter results for any category name appear within 1 second of the user finishing typing, with no page reload required.
- **SC-006**: 100% of payment slips remain accessible after their parent category is deleted (no orphaned data).
- **SC-007**: All form validation errors are visible inline within 200ms of a failed save attempt, without requiring a page reload.

## Assumptions

- The application already has a working database and persistence layer established by the `001-finance-manager` feature.
- A system-default "Uncategorized" category is pre-seeded in the database and cannot be deleted or renamed by the user.
- A curated set of icons (e.g., 20–40 common finance-related icons) is available within the application for user selection — no external icon-picker service is required.
- A color picker with at least 12 preset palette colors plus a freeform hex/hue picker is available.
- Pre-seeded default categories (Rent, Utilities, Food, Leisure, Credit Card) are treated as system defaults and are protected from deletion.
- The Category Management page is accessible from the main application navigation.
- This feature does not include user-level permissions or multi-user scenarios; it is a single-user workspace.
- The category color and icon are purely cosmetic and used for display throughout the app (e.g., on payment slip cards, dashboard charts).
