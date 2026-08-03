# ROUTES KNOWLEDGE BASE

**Generated:** 2026-08-02

## OVERVIEW

Qwik City file-based routing under `src/routes/`. All user-facing pages live under `[lang]/` for locale scoping.

## STRUCTURE

```
routes/
├── index.tsx            # Root redirect (→ /[lang]/)
└── [lang]/              # Dynamic locale segment
    ├── plugin.ts        # Middleware: locale resolution + qwik-speak setup
    ├── layout.tsx       # Shared layout: nav + CheckBox wrapper
    ├── index.tsx        # Main menu page (AI search + allergen filtering)
    └── about/
        └── index.tsx    # About page with DocumentHead
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add new page | `routes/[lang]/new-page/index.tsx` | Auto-discovered by Qwik City |
| Change layout | `routes/[lang]/layout.tsx` | Affects ALL pages under `[lang]/` |
| Modify locale resolution | `routes/plugin.ts` | Runs before any page renders |
| Add route validation | `layout.tsx` onRequest handler | Redirect invalid locales to default |

## CONVENTIONS

- **Locale validation**: `layout.tsx` onRequest throws `redirect(302, ...)` for unsupported locales — never return 404 silently.
- **Dynamic URLs**: Build locale-prefixed URLs with `useSpeakLocale().lang` + template literals (e.g., `/${locale.lang}/about/`).
- **DocumentHead**: Export `head: DocumentHead` from page files for SEO meta tags. Used by `router-head/`.
- **Shared layout**: Components in `layout.tsx` (nav, CheckBox) persist across all `[lang]/*` pages.

## ANTI-PATTERNS

- **DO NOT** put locale validation in `plugin.ts` only — `layout.tsx` onRequest is the secondary guard.
- **DO NOT** access `params.lang` outside of RequestHandler context — use `useSpeakLocale()` in components.
- **DO NOT** create pages outside `[lang]/` for content pages — root `index.tsx` should only redirect.
