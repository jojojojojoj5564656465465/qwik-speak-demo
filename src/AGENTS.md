# SRC KNOWLEDGE BASE

**Generated:** 2026-08-02

## OVERVIEW

Core application bootstrap: SSR entry, root component, i18n wiring, and global state initialization.

## STRUCTURE

```
src/
├── entry.ssr.tsx        # SSR render entry (locale-scoped chunk base)
├── entry.dev.tsx        # Dev entry (hot reload)
├── entry.preview.tsx    # Preview entry (production-like dev)
├── entry.cloudflare-pages.tsx  # Cloudflare Pages adapter entry
├── root.tsx             # Root component (i18n + AllergiesContext provider)
├── global.css           # Tailwind v4 import
├── speak-config.ts      # qwik-speak configuration (locales, assets)
├── speak-functions.ts   # Translation loader (server$, import.meta.glob)
├── routes/              # Qwik City routing (see routes/AGENTS.md)
├── components/          # UI components (see components/AGENTS.md)
├── contexts/            # Global state (see below)
├── data/                # Menu data (see data/AGENTS.md)
├── types/               # Shared types (see types/AGENTS.md)
└── scripts/             # AI integration (see scripts/AGENTS.md)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Modify SSR output | `entry.ssr.tsx` | Change `containerAttributes.lang` or `extractBase()` |
| Update root providers | `root.tsx` | Add new contexts or i18n config changes |
| Change i18n setup | `speak-config.ts` + `speak-functions.ts` | Add locales, assets, or change loader |
| Add global state | `contexts/allergies-context.tsx` | Use `createContextId` pattern |
| Route middleware | `routes/plugin.ts` | Runs before every request — locale resolution |

## CONVENTIONS

- **Locale scoping**: `extractBase()` in `entry.ssr.tsx` returns `/build/<locale>` in prod, `/build` in dev.
- **Global state pattern**: `createContextId<T>()` in contexts, `useStore<>()` in root, `useContext()` in consumers.
- **i18n initialization**: `useQwikSpeak({ config, translationFn })` called once in root.tsx. Never duplicate.
- **Entry points**: Four entry files exist for different environments — never modify `entry.ssr.tsx` without checking adapter configs.

## ANTI-PATTERNS

- **DO NOT** remove `useQwikSpeak` from `root.tsx` — breaks entire i18n system.
- **DO NOT** modify `containerAttributes.lang` in `entry.ssr.tsx` — required for a11y/SEO and locale detection.
- **DO NOT** put component logic in entry files — entries must stay thin (render + config only).
