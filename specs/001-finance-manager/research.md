# Research and Technical Choices: Gamified Personal Finance Manager

## 1. Database Selection: SQLite with Prisma
- **Decision**: SQLite database using Prisma ORM.
- **Rationale**: The user requested a "local database". SQLite runs as a single local file (e.g., `prisma/dev.db`), requires no external server setup, is highly performant for a personal app, and is fully supported by Node.js/Next.js. Prisma provides TypeScript type safety, easy migrations, and direct database queries.
- **Alternatives Considered**: 
  - *IndexedDB / LocalStorage*: Rejected because the user asked for a "database" and server-side features of Next.js run better with SQL databases.
  - *PostgreSQL*: Rejected as it is not a "local" file-based database by default (requires service configuration).

## 2. Styling Strategy: Next.js + Vanilla CSS Custom Properties
- **Decision**: Next.js global CSS for the design system combined with CSS Modules (`*.module.css`) for component styling.
- **Rationale**: The repository's constitution mandates **Vanilla CSS** and prohibits Tailwind CSS. We will define CSS Custom Properties (variables) in `src/app/globals.css` for colors (dark mode defaults, rich gradients), spacing, and font variables (Google Fonts Outfit/Inter). CSS Modules prevent selector collision and provide clean styles.
- **Alternatives Considered**: 
  - *Tailwind CSS*: Prohibited by the repository constitution.
  - *Styled Components*: Adds runtime JavaScript overhead; CSS Modules are more standard in Next.js.

## 3. Visualization: Recharts
- **Decision**: Recharts library.
- **Rationale**: Extremely interactive, responsive, built natively for React, and supports smooth micro-animations. It fits the "sleek and interactive dashboard" requirement.
- **Alternatives Considered**:
  - *Chart.js*: Good, but requires wrapper packages for React and is less flexible with custom SVG components.

## 4. File Attachment Storage
- **Decision**: Save uploaded files (PDFs/images) to the local file system in a project subdirectory (e.g., `public/uploads/`) and store the relative file path in the `PaymentSlip.documentPath` field.
- **Rationale**: SQLite is not optimized for large binary blobs (can bloat database size). Staging files on the filesystem is standard practice, and `public/` is directly accessible via web browsers in Next.js.
- **Alternatives Considered**:
  - *Base64 Database Storage*: Bloats SQL queries and leads to high memory utilization.
  - *Cloud Storage (S3/Cloudinary)*: Out of scope for a local database setup.

## 5. Gamification: Custom Achievement Evaluation
- **Decision**: Create an API route in Next.js that runs validation rules whenever a payment slip is created or updated. Unlocked achievements are logged in the `Achievement` table with timestamp.
- **Rationale**: Keeping the logic server-side ensures consistency, while database persistence ensures achievements remain unlocked across sessions.
