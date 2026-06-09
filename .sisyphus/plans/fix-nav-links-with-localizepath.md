# Plan: Refactor layout nav links to use `localizePath()` instead of manual URL construction

**Date:** 2026-05-24  
**Status:** Ready  
**Files affected:** 1  

---

## Problem
The navbar in `src/routes/[lang]/layout.tsx` manually constructs `homeHref` and `aboutHref` using template literals:
```
const homeHref = `/${locale.lang}/`;
const aboutHref = `/${locale.lang}/about/`;
```
This works but is redundant — `localizePath()` already handles language prefixing automatically when given plain path strings.

## Solution
Replace manual path construction with `localizePath()` calls:
- `getPath("/")` → localized home path
- `getPath("/about/")` → localized about path

Remove the now-unused `useSpeakLocale` import (replaced by `localizePath`'s implicit locale detection).

## Tasks

### Task 1: Edit layout.tsx
**File:** `src/routes/[lang]/layout.tsx`

**Changes:**
1. Replace import: `useSpeakLocale` → `localizePath`
2. Replace body: remove `const locale = useSpeakLocale()`, add `const getPath = localizePath()`
3. Replace: `const homeHref = \`/${locale.lang}/\`` → `const homeHref = getPath("/")`
4. Replace: `const aboutHref = \`/${locale.lang}/about/\`` → `const aboutHref = getPath("/about/")`

**Before/After:**
```tsx
// BEFORE
import { inlineTranslate, useSpeakLocale } from "qwik-speak";
// ...
const t = inlineTranslate();
const locale = useSpeakLocale();
const homeHref = `/${locale.lang}/`;
const aboutHref = `/${locale.lang}/about/`;

// AFTER
import { inlineTranslate, localizePath } from "qwik-speak";
// ...
const t = inlineTranslate();
const getPath = localizePath();
const homeHref = getPath("/");
const aboutHref = getPath("/about/");
```

### Task 2: Verify
1. Run `lsp_diagnostics` on `src/routes/[lang]/layout.tsx` — must return 0 errors
2. Run `bun dev` — must start without errors
3. Test manually: navigate to `/fr/`, `/en/about/`, `/es/` — all links must work

### Task 3: Extract translations (if new keys were added)
Run `bun run qwik-speak-extract` (no new keys expected here, but good practice)

---

## Verification
- [x] No LSP errors
- [x] Dev server starts clean
- [x] `/en/` → click "À propos" → `/en/about/` → click "Bienvenue" → `/en/`
- [x] Same for `/es/` and `/fr/`
