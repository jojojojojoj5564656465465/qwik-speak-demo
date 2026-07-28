# SRC KNOWLEDGE BASE

**Generated:** 2026-07-24

## OVERVIEW

Core application logic: SSR entry, root component, routing, and global state.

## STRUCTURE

```
src/
├── entry.ssr.tsx   # SSR entry (locale-scoped builds)
├── root.tsx        # Root component (i18n + AllergiesContext)
├── routes/         # File-based routing
├── components/     # Reusable UI
└── contexts/       # Global state (allergies)
```

## WHERE TO LOOK

| Task                  | Location                        | Notes                                |
| --------------------- | ------------------------------- | ------------------------------------ |
| Modify SSR behavior   | `entry.ssr.tsx`                 | Locale scoping, container attributes |
| Update root component | `root.tsx`                      | i18n, global state, or `<head>`      |
| Add global state      | `contexts/allergies-context.ts` | `useSignal` + `useContextProvider`   |

## CONVENTIONS

- **Locale scoping**: `extractBase()` in `entry.ssr.tsx` isolates builds by locale.
- **Global state**: `AllergiesContext` initialized in `root.tsx` (shared via Qwik context API).
- **i18n**: `useQwikSpeak` in `root.tsx` injects `t()` across the app.

## ANTI-PATTERNS

- **DO NOT** remove `useQwikSpeak` from `root.tsx` (breaks i18n).
- **DO NOT** modify `containerAttributes.lang` in `entry.ssr.tsx` (required for a11y/SEO).
