AGENTS GUIDE FOR TT-CRONOGRAMA
================================

1. PURPOSE
   - This document teaches autonomous agents how to work inside this Next.js repo.
   - Prioritize developer velocity while keeping the existing design language intact.

2. HIGH-LEVEL STACK
   - Next.js 16 App Router with `use client` components where needed.
   - TypeScript everywhere; strict mode is enabled in `tsconfig.json`.
   - Tailwind v4 via `@tailwindcss/postcss`; class merging handled with `cn` helper.
   - Firebase (Firestore, Storage, Auth) for persistence plus Google Sheets ingestion utilities.
   - Security: Storage CORS (`docs/storage-cors.md`), Firestore Rules (`docs/firestore-rules.md`).

3. PACKAGE MANAGER & SCRIPTS
   - **Must use `pnpm`** (lockfile is `pnpm-lock.yaml`).
   - `pnpm dev` → local dev server on port 3000 (primary verification method).
   - `pnpm build` → production bundle (includes SW build through Serwist wrapper).
   - `pnpm start` → serve built output.
   - `pnpm lint` → run ESLint using `eslint.config.mjs` (Next core web vitals + TS config).
   - `pnpm lint --fix` → auto-fix linting issues (preferred over manual fixes).

4. DIRECTORY STRUCTURE MAP
   - `app/` → Next.js App Router (pages/layouts).
     - `app/admin/` → Protected admin dashboard (separate layout).
     - `app/(marketing)/` → (Implicit) Public facing pages like `products`, `races`, `benefits`.
     - `app/sw.ts` → Service Worker definition (Serwist).
   - `components/` → React components.
     - `components/ui/` → Shadcn-like primitives (Button, Card, Dialog).
     - `components/admin/` → Admin-specific tables/forms.
   - `lib/` → Business logic & utilities.
     - `lib/firebase/` → Firebase config and service modules (API layer).
     - `lib/data.ts` → Shared TypeScript interfaces (source of truth for types).
     - `lib/utils.ts` → Helper functions (e.g., `cn` for Tailwind).
   - `hooks/` → Custom React hooks.
   - `docs/` → Project documentation.

5. RUNNING TESTS (OR LACK THEREOF)
   - **No test suite exists currently.**
   - Do NOT run `npm test` or `pnpm test` unless you have implemented it.
   - If adding tests:
     - Use **Vitest** (compatible with Next.js/Vite ecosystem).
     - Add `"test": "vitest"` to `package.json`.
     - Ensure single-test runs work: `pnpm test path/to/file.test.ts`.

6. LINTING DETAILS
   - ESLint extends `eslint-config-next` (core web vitals + TS).
   - **Mandatory:** Run `pnpm lint` after any `.ts` or `.tsx` modification.
   - Fix all lint errors before committing; do not suppress them without strong reasoning.

7. FORMATTING & STYLING
   - Indentation: 2 spaces.
   - Quotes: Single quotes preferred for TS/JS; double quotes for JSX attributes.
   - Line length: ~100-110 characters.
   - Tailwind: Order classes by importance (Layout -> Box Model -> Typography -> Visual -> Misc).
   - **Conditional Classes:** ALWAYS use `cn()` from `@/lib/utils` for conditional styles.

8. IMPORT RULES
   - Use absolute alias `@/` for all internal imports (maps to project root).
   - Order:
     1. Built-in Node modules
     2. External packages (React, Next, etc.)
     3. Internal Components (`@/components/...`)
     4. Internal Libs/Utils (`@/lib/...`)
     5. Types & Styles
   - No `require()`; use ES6 `import`.

9. TYPESCRIPT CONVENTIONS
   - **Strict Typing:** No implicit `any`. Explicitly type function args and returns.
   - **Interfaces:** Define shared data models in `lib/data.ts`.
   - **UI State:** Use discriminated unions (e.g., `type Status = 'idle' | 'loading' | 'success' | 'error'`).
   - **Null Safety:** Use optional chaining (`?.`) and nullish coalescing (`??`) extensively.

10. NAMING CONVENTIONS
    - **Files:** `kebab-case.ts` / `kebab-case.tsx`.
    - **Components:** `PascalCase` (`BenefitList`).
    - **Functions/Hooks:** `camelCase` (`useBenefits`, `calculateTotal`).
    - **Constants:** `SCREAMING_SNAKE_CASE` (`MAX_ITEMS_PER_PAGE`).
    - **Directories:** `kebab-case` (matching the route or category).

11. ERROR HANDLING
    - **Firebase:** Wrap all async calls in try/catch. Log errors with context.
    - **UI Feedback:** Use `sonner` (toast) for user-facing errors.
    - **Critical Failures:** Throw exceptions for data integrity issues; let Error Boundaries catch them.

12. DATA FLOW & STATE
    - **Fetching:** Centralize Firebase calls in `lib/firebase/`.
    - **Forms:** Use `react-hook-form` + `zod` for complex inputs.
    - **Local State:** `useState` is fine for simple UI toggles.
    - **Global State:** Use Context (`contexts/`) sparingly (e.g., Auth).

13. UI STYLE GUARDS
    - **Identity:** Bold typography, italic uppercase labels, neon accents.
    - **Responsiveness:** Mobile-first. Use `md:` and `lg:` overrides.
    - **Motion:** `framer-motion` for transitions (keep < 0.6s).
    - **Components:** Reuse `components/ui` primitives. Do not reinvent the wheel.

14. AUTH & ROUTING
    - `AuthProvider` wraps the app.
    - Admin routes (`/admin`) are protected by `AdminGuard`.
    - Register new public routes in `components/navbar.tsx`.

15. ENV & SECRETS
    - Config in `.env.local` (do not commit).
    - Firebase keys are loaded from environment variables.
    - Document new required variables in the PR description.

16. BUILD FEATURES
    - Service Worker (`sw.ts`) handles PWA capabilities.
    - Images: `next/image` requires host allowlisting in `next.config.ts`.
    - Redirects: Managed in `next.config.ts`.

17. ACCESSIBILITY
    - Images must have `alt` text.
    - Interactive elements must be keyboard accessible.
    - Semantic HTML (`<main>`, `<section>`, `<nav>`) over `<div>` soup.

18. GIT WORKFLOW FOR AGENTS
    - **Atomic Commits:** One logical change per commit.
    - **Messages:** Imperative mood ("Fix login bug", not "Fixed login bug").
    - **Safety:** Never force push. Never commit secrets.
    - **Review:** Self-review `git diff` before committing.

19. DOCS & RULES CHECK
    - **Status (2026-02-03):** No Cursor (`.cursor/`) or Copilot (`.github/`) rules found.
    - **Action:** If you see these folders appear, read them immediately.
    - **New Docs:** Place in `docs/` using Markdown. Keep it concise.

20. TROUBLESHOOTING
    - **Env Issues:** If build fails on missing keys, check `.env.local` vs `.env.example` (if exists).
    - **Permissions:** Firebase "Permission Denied" usually means Rules or Auth context issues.
    - **Styles:** If Tailwind classes aren't applying, check `tailwind.config.ts` content array or invalid class syntax.

21. VERIFICATION CHECKLIST (MANUAL)
    Since there is no automated test suite, you MUST manually verify:
    1. **Build:** Run `pnpm build` to check for TS/Lint/Build errors.
    2. **Lint:** Run `pnpm lint` explicitly.
    3. **Runtime:** Start `pnpm dev` and visit the affected pages.
       - Check happy path.
       - Check error states.
       - Check mobile view (responsive).

END OF GUIDE
