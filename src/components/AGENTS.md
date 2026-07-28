# COMPONENTS KNOWLEDGE BASE

**Generated:** 2026-07-24

## OVERVIEW

Reusable UI components with Qwik `component$()` syntax.

## STRUCTURE

```
components/
├── CheckBox/          # Allergen filter checkbox
├── FoodItem/          # Menu item (with Popover)
├── language-selector/ # Locale switcher
├── router-head/       # Dynamic `<head>` management
└── SearchBox/         # Search input
```

## WHERE TO LOOK

| Task            | Location                      | Notes                                 |
| --------------- | ----------------------------- | ------------------------------------- |
| Add component   | `components/NewComponent/`    | Use `component$()` + `export default` |
| Modify `<head>` | `router-head/router-head.tsx` | Update `DocumentHead`                 |

## CONVENTIONS

- **Qwik syntax**: `component$()` for components, `$()` for lazy-loaded functions.
- **Props**: TypeScript interfaces for all component props.
- **State**: Prefer `useSignal` or global context over local state.

## ANTI-PATTERNS

- **DO NOT** use client-side state in components (use `AllergiesContext` instead).
- **DO NOT** remove `export default` from components (required for Qwik).
