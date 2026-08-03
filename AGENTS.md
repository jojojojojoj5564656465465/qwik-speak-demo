# PROJECT KNOWLEDGE BASE

**Generated:** 2026-08-02
**Commit:** f7d839c
**Branch:** main

## OVERVIEW

Qwik City SSR restaurant menu app with **i18n (fr-FR/en-US/es-CO)**, **allergen filtering**, and **NVIDIA AI semantic search**. Deployed on Cloudflare Pages.

## STRUCTURE

```
speek/
├── src/
│   ├── entry.ssr.tsx       # SSR entry + locale-scoped chunk base
│   ├── root.tsx            # Root: qwik-speak init + AllergiesContext
│   ├── speak-config.ts     # i18n config (locales, assets)
│   ├── speak-functions.ts  # Translation loader (server$ + import.meta.glob)
│   ├── global.css          # Tailwind v4 import only
│   ├── routes/             # File-based routing ([lang] prefix)
│   │   ├── plugin.ts       # Locale resolution middleware (request handler)
│   │   └── [lang]/         # Dynamic locale route segment
│   │       ├── layout.tsx  # Nav + CheckBox wrapper (shared across pages)
│   │       ├── index.tsx   # Menu search + AI filtering (main page)
│   │       └── about/      # Static about page
│   ├── components/         # Reusable UI (see src/components/AGENTS.md)
│   ├── contexts/           # Global state (see src/contexts/)
│   ├── data/               # Menu data + static JSON (see src/data/)
│   ├── types/              # Shared TypeScript types (see src/types/)
│   └── scripts/            # AI integration (see src/scripts/)
├── public/i18n/<lang>/     # Translations: app, home, about, menu, allergies, checkbox, search, lang, runtime
├── adapters/cloudflare-pages/vite.config.ts  # Cloudflare adapter build config
├── vite.config.ts          # Base Vite config (qwikCity, qwikSpeakInline, Tailwind)
├── tsconfig.json           # ~/* alias → ./src/*, CSS modules plugin
└── package.json            # bun workspace, wrangler deploy
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add locale | `src/speak-config.ts` + `public/i18n/<lang>/` | Must add to both or i18n breaks |
| Modify SSR/chunks | `src/entry.ssr.tsx` | Update `extractBase()` if chunk path changes |
| Route middleware | `src/routes/plugin.ts` | Locale resolution before any component renders |
| AI search tuning | `src/scripts/openIa.ts` | System prompt + model config (poolside/laguna-xs-2.1) |
| Deploy config | `adapters/cloudflare-pages/vite.config.ts` | Extends base vite config with Cloudflare adapter |
| Extract i18n keys | `bun qwik-speak-extract` | Writes to `public/i18n/<lang>/` |

## CONVENTIONS

- **i18n keys**: `t("namespace.key@@fallback")` — fallback after `@@` used if key missing.
- **Path alias**: `~/*` maps to `./src/*` (tsconfig `paths`). Always use `~` not relative paths.
- **Locale scoping**: Production builds isolate chunks per locale at `/build/<lang>/`. Dev uses `/build/`.
- **Qwik reactivity**: `useSignal` for local state, `useStore` for complex objects, `useContextProvider` for cross-component sharing.
- **server$**: Wraps server-only code (API calls, env vars). Never imported into client bundles.
- **Currency**: `useFormatNumber()` from qwik-speak handles locale-aware formatting. Do NOT hardcode currency symbols.
- **CSS**: Use CSS Modules (`.module.css`) with `styles` import. Tailwind utility classes also available globally.

## ANTI-PATTERNS (THIS PROJECT)

- **DO NOT** remove `<html lang="...">` from `entry.ssr.tsx` — required for i18n + a11y + SEO.
- **DO NOT** call `console.log` in production code — Vite strips it in build; use server-side logging instead.
- **DO NOT** modify `entry.ssr.tsx` without checking `vite.config.ts` base config alignment.
- **DO NOT** add locales to `public/i18n/` without also adding to `src/speak-config.ts` `supportedLocales` array.
- **DO NOT** use client-side state for allergen filters — must use `AllergiesContext` from root.
- **DO NOT** remove `export default` from components — Qwik requires it for route/component discovery.

## UNIQUE STYLES

- **Resumability**: State serialized to HTML, no hydration overhead. Components are lazy-loaded on interaction.
- **AI Search Pattern**: `useResource$` tracks `lastQuery` signal → triggers `serverIa()` (server$ wrapped) → combines with allergen filter (AND logic).
- **Locale-Scoped Builds**: Each locale gets isolated JS bundles (`/build/fr-FR/`, `/build/en-US/`, `/build/es-CO/`) — translation assets included per-bundle.
- **Allergen Filter**: AND logic — dishes must contain ALL selected allergens to pass filter (opposite of typical "exclude" semantics).

## COMMANDS

```bash
bun dev                    # SSR dev server (Vite, mode=ssr)
bun build                  # Client + server build (locale-scoped chunks)
bun preview                # Preview production build locally
bun serve                  # Cloudflare Pages dev server (wrangler)
bun qwik-speak-extract     # Extract i18n keys → public/i18n/<lang>/
bun lint                   # ESLint on src/**/*.ts*
bun fmt                    # Prettier format all files
```

## NOTES

- **Env vars required**: `NVIDIA_API_KEY` (or custom base URL via `NVIDIA_BASE_URL`) for AI search.
- **No tests configured**: Project has zero test infrastructure. Add vitest if needed.
- **CI/CD**: None — deploy via Cloudflare Pages Git integration manually.
- **Menu data source**: `src/data/newmenu.ts` (1038-line monolith — single source of truth for 91 dishes).
- **Known bug**: `FoodItem/index.tsx` line 55 hardcodes `"es-CO"` locale for price formatting — should respect active locale.
