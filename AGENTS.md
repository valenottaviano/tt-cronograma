AGENTS GUIDE FOR TT-CRONOGRAMA
================================

1. PURPOSE
   - This document teaches autonomous agents how to work inside this Next.js repo.
   - Prioritize developer velocity while keeping the existing design language intact.

2. HIGH-LEVEL STACK
   - Next.js 16 App Router with `use client` components where needed.
   - TypeScript everywhere; strict mode is enabled in `tsconfig.json`.
   - Tailwind v4 via `@tailwindcss/postcss`; class merging handled with `cn` helper.
   - Firebase (Firestore, Storage, Auth) for persistence plus Google Sheets ingestion utilities. Storage CORS is configured via `docs/storage-cors.md` and security rules live in `docs/firestore-rules.md` / `docs/firebase-storage.md`.

3. PACKAGE MANAGER & SCRIPTS
   - Default to `pnpm`; lockfile is `pnpm-lock.yaml`.
   - `pnpm dev` → local dev server on port 3000.
   - `pnpm build` → production bundle (includes SW build through Serwist wrapper).
   - `pnpm start` → serve built output.
   - `pnpm lint` → run ESLint using `eslint.config.mjs` (Next core web vitals + TS config).
   - No official test script exists; add one before introducing automated tests.

4. RUNNING TESTS (OR LACK THEREOF)
   - There is no Jest/Vitest config and no `test` script today.
   - If you introduce tests, prefer Vitest; define `pnpm test` and ensure single-test invocation via `pnpm test path/to/file.test.ts`.
   - Until a harness exists, manual verification via `pnpm dev` and targeted component checks is expected.

5. LINTING DETAILS
   - ESLint extends `eslint-config-next` (core web vitals + TS) with default ignores overridden.
   - Always run `pnpm lint` after touching `.ts` or `.tsx` files; fix issues before committing.
   - Prefer ESLint auto-fixes via `pnpm lint --fix` rather than manual edits when practical.

6. FORMATTING & STYLING
   - Project relies on Prettier defaults provided by Next tooling; keep 2-space indentation for JSON, TS.
   - Stick to single quotes in TS/TSX unless template literals or JSX attributes require double quotes.
   - Avoid trailing spaces and keep max line length near 100–110 chars for readability.
   - Tailwind classes follow “most important first” ordering (layout → spacing → typography → color → effects).
   - Use `cn()` (`lib/utils.ts`) when class names are conditional.

7. IMPORT RULES
   - Absolute alias `@/` maps to repo root; prefer it over long relative paths.
   - Import order: Node built-ins, external packages, alias imports, relative paths, then styles/assets.
   - Group React hooks/components first, then utilities, then types.
   - Do not use `require`; stick to ES modules.

8. TYPESCRIPT CONVENTIONS
   - Always type function arguments/returns; rely on interface/type aliases from `lib/data.ts` when available.
   - Prefer `type` for unions and `interface` for object shapes shared across files.
   - Use discriminated unions for UI states instead of `any` or `string` status flags.
   - Enable strict null checks by guarding optional values before usage (`if (!value) return null`).

9. NAMING
   - Components: PascalCase (`BenefitList`).
   - Hooks/utils: camelCase (`useBenefits`, `formatPrice`).
   - Constants: SCREAMING_SNAKE_CASE when exported (`BENEFITS_COLLECTION`).
   - File names follow kebab-case except React components which may use matching PascalCase directories.

10. ERROR HANDLING
   - Firebase calls already wrap try/catch; extend the pattern and log contextual messages (`console.error('msg', err)`).
   - Surface user-friendly toasts via `sonner` inside client components; avoid leaking raw errors to users.
   - When failing silently is dangerous (data loss, payments), bubble errors up via thrown exceptions and let Next error boundaries manage display.

11. DATA FLOW
   - Shared interfaces live in `lib/data.ts`; update them before touching UI.
   - Firebase modules (under `lib/firebase`) should be the only place hitting the network; UI imports functions from there.
   - For Sheets-based seeding, refer to `lib/firebase/seed-*` scripts; ensure deduplication keys stay stable.

12. UI STYLE GUARDS
   - Public-facing pages lean heavily on bold typography, italic uppercase labels, and neon accent colors. Preserve that tone.
   - When adding mobile layouts, prefer utility-first responsive classes (`md:`, `lg:`) inside the same component.
   - Use Radix primitives (Dialog, Sheet, Popover) already wrapped inside `components/ui` for consistency.
   - Motion: rely on `framer-motion` for nav transitions/entrances; keep durations ≤0.6s unless storytelling demands more.

13. ACCESSIBILITY
   - Provide `alt` text for every `Image`. When logos repeat, still include company names.
   - Use semantic HTML (`button`, `nav`, `header`) before resorting to divs.
   - Keyboard traps: ensure Dialog/Sheet components expose close controls and focusable elements.

14. AUTH & ROUTING
   - `AuthProvider` (contexts/auth-context) wraps the app; check it before touching protected routes.
   - Admin routes live under `/app/admin`; they share the same RootLayout but hide Navbar/Footer. Preserve that split.
   - When adding routes, register navigation links inside `components/navbar.tsx` and admin menus as needed.

15. ENV & SECRETS
   - `.env` already exists locally; never commit it.
   - Firebase config reads from environment; fall back gracefully if keys are absent.
   - When introducing new secrets, document them in README and mention required `.env.local` entries.

16. BUILD FEATURES
   - Service worker is generated via Serwist (`app/sw.ts` → `public/sw.js`). Keep `enable` flag tied to production builds.
   - `next.config.ts` allows remote images via wildcard hostnames; no need to extend unless you block remote origins.
   - For redirects, modify `async redirects()`; ensure they remain permanent unless there is a migration reason.

17. STATE & FORMS
   - Forms use `react-hook-form` plus Zod validators; follow that pattern for new complex forms.
   - Keep form state local with `useState` only for simple inputs (e.g., BenefitForm currently uses `useState`).
   - File uploads rely on Firebase Storage helper `uploadBenefitLogo`; reuse it rather than re-implementing uploads.

18. STYLING RESOURCES
   - `components/ui` contains shadcn-inspired primitives (Button, Card, Sheet, Dialog, etc.).
   - When you need new primitives, co-locate them in `components/ui` and wire them with `data-slot` attributes.
   - Avoid inline `style` props unless animating values; favor Tailwind utilities.

19. PERFORMANCE PRACTICES
   - Prefer `next/image` for remote assets; configure `remotePatterns` if new domains appear.
   - Use `React.Suspense`/`loading.tsx` route segments for long data fetches (see `app/benefits/loading.tsx`).
   - Remove unused packages promptly; smaller bundles improve PWA performance.

20. TESTING NEW FEATURES WITHOUT A TEST SUITE
   - Spin up `pnpm dev`; hit key routes: `/`, `/benefits`, `/races`, `/store`, `/admin` (requires auth logic).
   - For single component validation, create temporary stories inside `app/playground` (not committed) or rely on Jest snapshot prototypes before merging.
   - Document manual QA steps in PR descriptions until automated tests exist.

21. GIT WORKFLOW FOR AGENTS
   - Never amend user commits; follow instructions in the system prompt when staging/committing.
   - Keep PRs focused; multiple logical changes require separate commits unless instructed otherwise.
   - Provide concise commit messages summarizing intent (“tweak benefit cards for mobile”) rather than raw file lists.

22. DOCS & RULES CHECK
   - There are no Cursor rule files or Copilot instruction files in this repo as of 2026-02-03.
   - Re-run `ls .cursor` and `ls .github` before assuming this statement is still true.

23. WHEN ADDING NEW DOCS
   - Use Markdown with 80–90 char lines for readability.
   - Reference files with inline code formatting (e.g., `components/benefit-list.tsx`).
   - Provide actionable steps; agent docs should avoid fluff.

24. TROUBLESHOOTING QUICK NOTES
   - If `pnpm dev` fails due to missing env vars, create `.env.local` mirroring `.env` keys and set placeholders.
   - Firebase permission errors: ensure service account credentials match emulator or production settings.
   - Tailwind build errors likely stem from invalid class names; double-check dynamic strings.

25. FINAL REMINDERS
   - Maintain the bold TT visual identity; gradients + uppercase microcopy are part of the brand.
   - Keep mobile-first mindset; every new component should define sensible base styles before `md:` overrides.
   - Document notable architectural decisions inside new PR descriptions or inline comments where ambiguity would slow future agents.
   - Before handing work back, run `pnpm lint` (mandatory) and `pnpm build` if the change touches build/runtime config.

END OF GUIDE (~150 lines)
