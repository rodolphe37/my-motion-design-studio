# Contributing to MyMotionStudio

First off, thank you for considering contributing! This project is a
single-maintainer, spare-time effort, so any help — bug reports, fixes,
features, or even just clearer docs — is genuinely appreciated.

This guide is intentionally practical rather than exhaustive. If something
here is unclear or missing, opening an issue to ask is itself a welcome
contribution.

> **Note on language**: the codebase, comments, and this guide are in
> English, but the product itself (UI copy, in-app documentation) is French
> only for now. See [Internationalization](#internationalization) below if
> you'd like to help change that.

## Table of contents

- [Code of Conduct](#code-of-conduct)
- [Ways to contribute](#ways-to-contribute)
- [Development setup](#development-setup)
- [Project structure](#project-structure)
- [Coding conventions](#coding-conventions)
- [Commit messages](#commit-messages)
- [Submitting a pull request](#submitting-a-pull-request)
- [Reporting bugs](#reporting-bugs)
- [Suggesting features](#suggesting-features)
- [Internationalization](#internationalization)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By
participating, you're expected to uphold it.

## Ways to contribute

You don't need to write code to help:

- **Bug reports** — see [Reporting bugs](#reporting-bugs).
- **Feature requests / ideas** — see [Suggesting features](#suggesting-features).
- **Documentation** — the in-app docs (`src/pages/DocsPage.tsx`) and this
  README are both fair game for fixes and improvements.
- **Code** — bug fixes, new features, performance improvements, or tests
  (see the README's [Testing](README.md#testing) section for current
  coverage and gaps).
- **Design/UX feedback** — this is a creative tool; usability issues are as
  valuable as functional bugs.

For anything non-trivial (a new feature, a behavior change, a large
refactor), please open an issue first to discuss the approach before
investing time in a PR. It avoids wasted effort if the direction doesn't fit
the project.

## Development setup

Requirements: Node.js `20.19+` or `22.12+`, and npm. This project uses npm
only — `package-lock.json` is the committed lockfile; please don't add a
`yarn.lock` or `pnpm-lock.yaml` in a PR.

```bash
git clone https://github.com/rodolphe37/my-motion-design-studio.git
cd my-motion-design-studio
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Before opening a PR, make sure
these all pass:

```bash
npm run full-test   # typecheck + lint + test, in sequence, stops at the first failure
npm run build        # production build (also catches type/PWA config issues)
```

`full-test` is a thin wrapper — `npm run typecheck && npm run lint && npm
run test` — kept as a single command for convenience. If you touch it,
keep the commands chained with `&&` (not `&`): `&` backgrounds each command
and only checks the *last* one's exit code, so a failing test or lint error
would silently not fail the script.

See the README's [Testing](README.md#testing) section for what's covered
today (`src/lib/` — store, animation, persistence, autosave) and what isn't
(component tests for `Canvas2D`/`Canvas3D`, CI). If you're adding a
non-trivial change to anything under `src/lib/`, a test alongside it is
appreciated; for UI-only changes, manual verification in the browser is
still the norm.

## Project structure

See the [Project Structure](README.md#project-structure) section of the
README for a directory-by-directory breakdown.

## Coding conventions

These aren't enforced by tooling beyond ESLint/TypeScript, but please try to
match the existing style:

- **TypeScript everywhere**, strict-ish — avoid `any`; prefer the discriminated
  union types already defined in `src/lib/types.ts` (e.g. `Layer`,
  `BackgroundFill`) over loosening them.
- **Functional React components + hooks only** — no class components except
  the one existing error boundary (`ImportErrorBoundary` in `Canvas3D.tsx`,
  which needs to be a class because error boundaries require it).
- **State lives in the Zustand store** (`src/lib/store.ts`). Component-local
  `useState` is fine for purely UI-local state (input focus, open/closed
  panels), but anything that's part of the actual project data belongs in
  the store, going through an action so it's cloned and pushed onto the
  undo history correctly. Look at an existing action (e.g. `updateLayer`)
  before adding a new one — they all follow the same
  `pushHistory` → `cloneProject` → mutate → `set()` pattern.
- **Styling with Tailwind utility classes**, using the shared component
  classes defined in `src/index.css` (`.btn`, `.btn-primary`, `.panel`,
  `.input`, `.icon-btn`, etc.) instead of re-implementing the same look
  inline. Colors use the `ink-*` semantic scale (see the comment block at
  the top of `index.css`) so the light/dark theme keeps working — avoid
  hardcoded hex colors or `dark:` variants.
- **No unnecessary comments.** Comments should explain *why*, not *what* —
  a non-obvious constraint, a workaround, a subtle invariant. If the code is
  self-explanatory, leave it uncommented.
- **No speculative abstractions.** Don't generalize a component or add a
  config option for a use case that doesn't exist yet.
- **French, in-app strings only.** Any user-facing text (labels, buttons,
  docs content) is French, matching the rest of the product. Code
  identifiers, comments, and commit messages stay in English.

## Commit messages

There's no strict format enforced, but commits in this repo tend to:

- Use an imperative, present-tense summary line (`Fix …`, `Add …`,
  `Implement …`), under ~72 characters.
- Include a short body explaining the *why* when the change isn't
  self-evident from the diff (root cause of a bug, trade-off behind a
  design decision, etc.).
- Bump the `version` field in `package.json` (semver, patch-level for most
  fixes) as part of the same commit when the change is user-facing, and
  mention the new version in the summary line (e.g. `"..., bump to
  0.3.0"`). This isn't required for docs-only or CI-only changes.

## Submitting a pull request

1. Fork the repo and create a branch off `main` (`git checkout -b
   fix/short-description`).
2. Make your change, following the conventions above.
3. Run `npm run full-test && npm run build` and fix
   anything that fails.
4. Manually verify the change in the browser — screenshots or a short
   screen recording in the PR description are appreciated for anything
   visual.
5. Open the PR against `main` with a clear description of *what* changed
   and *why*. Link any related issue.
6. CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs the same
   `full-test` + `build` sequence automatically on Node 22 and 24 — fix any
   red check before asking for review.
7. Be responsive to review feedback — this is a side project, so review
   turnaround may take a few days.

Note: since PRs come from forks, they don't get an automatic Netlify preview
deploy (fork PRs don't have access to repo secrets, by GitHub design) — only
branches pushed directly to this repo do. Maintainers reviewing a fork PR
should pull the branch and run `npm run build && npm run preview` locally.

Small, focused PRs are much easier to review than large ones touching many
unrelated things — if a change grew to cover several unrelated concerns,
consider splitting it.

## Reporting bugs

Open a [GitHub issue](https://github.com/rodolphe37/my-motion-design-studio/issues/new)
with:

- Steps to reproduce (as precise as possible — which project mode, which
  action, in what order).
- What you expected to happen vs. what actually happened.
- Browser + OS.
- Console errors, if any (DevTools → Console).
- If the bug is data-related (a project not saving, import producing a
  broken state, etc.), attaching the exported project JSON (menu ⋮ →
  "Exporter JSON" on the project card) makes reproduction much faster —
  strip out anything sensitive first (embedded images/models are
  base64-encoded inline in that file).

## Suggesting features

Open an issue describing the use case (not just the solution) — what are
you trying to accomplish, and where does the current app fall short? That
context makes it much easier to evaluate a request and discuss the right
approach, especially for anything touching the render pipeline (2D/Konva or
3D/Three.js) or the project's undo/save model.

## Internationalization

The app is French-only today (UI copy, in-app documentation, generated
project names). There's no i18n framework wired in — all strings are
inlined directly in the components. Adding proper i18n (extracting strings,
picking a library, wiring a locale switcher) would be a substantial,
cross-cutting change; if you're interested in tackling it, please open an
issue first to agree on an approach before starting, since it touches
nearly every component in `src/`.
