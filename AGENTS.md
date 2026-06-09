# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-21
**Commit:** f5e38af
**Branch:** main

## OVERVIEW
Qwik City starter app. SSR framework with resumability (no hydration overhead). File-based routing.

## STRUCTURE
```
speek/
├── src/
│   ├── components/     # Reusable UI components
│   │   └── router-head/   # <head> management via DocumentHead
│   ├── routes/        # File-based routing (index.tsx = /)
│   │   └── index.tsx
│   ├── entry.ssr.tsx  # SSR entry point
│   ├── entry.dev.tsx  # Dev entry
│   ├── entry.preview.tsx
│   ├── root.tsx       # Root component with QwikCityProvider
│   └── global.css
├── public/            # Static assets
├── vite.config.ts     # Qwik + QwikCity plugins
└── package.json
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add route | `src/routes/` | Create `new-route/index.tsx` |
| Add component | `src/components/` | `component$()` syntax |
| Modify `<head>` | `src/routes/*/index.tsx` | Export `head: DocumentHead` |
| Routing config | `vite.config.ts` | qwikCity() plugin |

## CONVENTIONS

### Qwik Component Syntax
```tsx
import { component$ } from "@builder.io/qwik";

export const MyComponent = component$(() => {
  return <div>...</div>;
});
```

### Routing
- `src/routes/index.tsx` = `/`
- `src/routes/about/index.tsx` = `/about`
- `src/routes/layout.tsx` = shared layout for nested routes
- Export `head: DocumentHead` for `<title>` and `<meta>`

### Path Aliases
```tsx
import "~/*";  // maps to ./src/*
```

### CSS Modules
Supported. Use `*.module.css`. Remove `typescript-plugin-css-modules` from tsconfig.json if unused.

## ANTI-PATTERNS (THIS PROJECT)
- **DO NOT** remove `<head>` or `<body>` from `root.tsx` - QwikCityProvider requires them
- **DO NOT** put qwik packages in `dependencies` - must be in `devDependencies`
- **DO NOT** use `console.log` in production - Vite strips in build

## UNIQUE STYLES

### Resumability
Qwik serializes state to HTML, resumes on interaction. No full hydration.
- Use `useSignal()`, `useStore()` for reactivity
- `$()` suffix for lazy-loaded functions

### DocumentHead
Export `head` from route components for `<title>`, `<meta>`, `<link>` injection via `RouterHead`.

## COMMANDS
```bash
bun dev        # SSR dev server (Vite)
bun build      # Client + server build + type check
bun preview    # Preview production build
bun fmt        # Prettier format
bun lint       # ESLint check
```

## NOTES
- No tests configured yet
- No CI/CD pipelines
- `entry.ssr.tsx` is the server entry - other entry files for dev/preview
- Manifest.json auto-generated in production (`!isDev` in root.tsx)