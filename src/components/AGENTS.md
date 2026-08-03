# COMPONENTS KNOWLEDGE BASE

**Generated:** 2026-08-02

## OVERVIEW

Reusable UI components using Qwik `component$()` syntax with CSS Modules + Tailwind.

## STRUCTURE

```
components/
├── CheckBox/            # Allergen filter panel (toggle all/reset)
├── FoodItem/            # Menu dish card (with Popover image)
│   └── Popover/         # Image zoom modal (native popover API)
├── language-selector/   # Locale switcher nav
├── router-head/         # Dynamic <head> tag management
├── SearchBox/           # AI search input with debounce
├── Title/               # Simple h1 wrapper
└── ButtonClose/         # Active allergen pill (remove button)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add component | `components/NewComponent/` | `index.tsx` + optional `.module.css` |
| Modify navigation | `language-selector/index.tsx` | Uses `localizePath()` from qwik-speak |
| Update `<head>` | `router-head/router-head.tsx` | Modifies `DocumentHead` via Qwik City |
| Fix price format bug | `FoodItem/index.tsx:55` | Hardcoded `"es-CO"` — should use active locale |

## CONVENTIONS

- **Qwik syntax**: `component$()` for components, `$()` for serializable event handlers passed as props.
- **Props**: TypeScript interfaces required (`export interface XxxProps`). Never omit prop types.
- **State**: Prefer global `AllergiesContext` over local `useSignal` for allergen state. Local signals OK for non-shared UI state.
- **CSS**: CSS Modules (`.module.css`) for scoped styles; Tailwind utilities for layout/spacing. Both can mix.
- **i18n in components**: Use `inlineTranslate()` for simple cases, `const t = inlineTranslate()` then `t("key@@fallback")`.

## ANTI-PATTERNS

- **DO NOT** use client-side state for allergen filters — must use `AllergiesContextStore` from `~/contexts/allergies-context`.
- **DO NOT** remove `export default` from components — Qwik component discovery requires it.
- **DO NOT** hardcode locales in `useFormatNumber()` calls — should derive from active speak locale.
- **DO NOT** put async logic directly in component body — use `useTask$` or `useResource$` instead.
