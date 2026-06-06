# Cami Finance App Constitution

## Core Principles

### I. Premium & Dynamic UX (WOW Factor)
Every user interface must deliver a modern, visually stunning, and premium first impression. Avoid generic colors (e.g., plain red, blue, green) and instead utilize curated, harmonious palettes (e.g., tailored HSL/RGB colors, sleek dark modes, and smooth gradients). Always import and use modern typography (e.g., Google Fonts like Inter, Outfit, or Roboto) rather than relying on browser defaults. Placeholders are strictly prohibited.

### II. Dynamic UX & Micro-Animations
The interface must feel alive, responsive, and highly interactive. Hover effects, active states, and subtle micro-animations for transitions and status updates must be implemented to guide and delight the user. State transitions (e.g., page navigation, filter updates, transaction addition) should be animated smoothly to maintain visual continuity.

### III. Semantic HTML5 & Vanilla CSS
Structure the web application using clean, semantic HTML5 elements (e.g., `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`). All styling must be written in Vanilla CSS to ensure maximum control, efficiency, and layout accuracy. Avoid Tailwind CSS or other utility-first libraries unless explicitly requested by the USER. A core design system of CSS variables (custom properties) must be established in `index.css` before designing any components.

### IV. Component-Driven & Responsive Architecture
Develop the application using focused, modular, and reusable components. Global layout configurations, layout files, and view routers must be kept separate from presentational components. Responsive design (mobile-first layout using CSS Grid and Flexbox) is non-negotiable, ensuring a seamless experience across mobile, tablet, and desktop screens.

### V. SEO, Accessibility, & Testability
Every page must adhere to basic SEO and accessibility (a11y) standards:
- Include proper, descriptive title tags and meta descriptions.
- Ensure correct heading hierarchy with exactly one `<h1>` per page.
- Apply high-contrast text and interactive focus states.
- Assign unique, descriptive IDs to all interactive elements to facilitate automated and browser-based testing.

## Technology Stack & Performance Standards

### Technology Stack
- **Core Framework & Languages**: HTML5, Vanilla CSS3 (Custom Properties), React, and Next.js.
- **Build Tooling**: Next.js for server-side rendering, static site generation, and optimized client-side performance.
- **Dependencies**: Keep external dependencies minimal and highly justified.

### Performance & Security
- Minimal asset payloads and optimized CSS/JS compilation.
- Defer/async non-critical scripts.
- Secure client-side state handling and inputs validation.

## Development Workflow & Quality Gates

### Phase 1: Understand & Plan
- Define the page/feature structure and visual requirements first.
- Create or update mockups and color palette specifications.

### Phase 2: Design Foundation
- Maintain `index.css` with CSS variables for fonts, spacing, colors, shadows, and base typography.

### Phase 3: Component Development
- Build individual UI components using classes mapped to CSS variables. Avoid ad-hoc inline styles.

### Phase 4: Page Assembly & Routing
- Integrate UI components into pages with a responsive grid/flex layout and state-based page switching/routing.

### Phase 5: Polish & Verification
- Review visual flows, add smooth micro-animations, and test accessibility.
- Verify that elements have unique IDs and that the page loads quickly without visual layout shifts.

## Governance
- This Constitution is the supreme authority for design and coding guidelines in the Cami Finance App repository.
- Deviating from these principles (e.g., using a library like Tailwind CSS, neglecting responsiveness) is only permitted if explicitly requested and approved by the user.
- Any amendments to this Constitution require updating the version number, dates, and committing changes to the version control system.

**Version**: 1.0.0 | **Ratified**: 2026-06-05 | **Last Amended**: 2026-06-05
