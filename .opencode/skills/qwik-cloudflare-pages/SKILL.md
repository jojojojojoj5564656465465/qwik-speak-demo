# Qwik Cloudflare Pages Skill

## Description
Automatise et guide le déploiement de projets Qwik City sur Cloudflare Pages. Gère l'installation de l'adapter, la configuration SSR/SSG, l'i18n, les variables d'environnement, et le déploiement via wrangler ou Git integration. Détecte et corrige les problèmes courants (403, locale mismatch, node version, _routes.json).

## Trigger Phrases
- "déployer sur cloudflare pages"
- "configurer cloudflare pages pour qwik"
- "adapter cloudflare pages"
- "qwik cloudflare deploy"
- "wrangler pages deploy"
- "problème 403 cloudflare pages"
- "locale mismatch cloudflare"
- "node version cloudflare pages"

## Workflow

### 1. Vérification initiale (parallel)
```bash
node -v
bun -v
git status --short
git log --oneline -5
ls adapters/cloudflare-pages/ 2>/dev/null
ls src/entry.cloudflare-pages.tsx 2>/dev/null
cat package.json | grep -E '"build.server"|wrangler'
cat wrangler.toml 2>/dev/null
```

### 2. Installation de l'adapter (si absent)
```bash
bun run qwik add cloudflare-pages
```

### 3. Configuration requise
- **Fichier `src/entry.cloudflare-pages.tsx`** (template ci-dessous)
- **`wrangler.toml`** (minimal):
  ```toml
  name = "your-project"
  compatibility_flags = ["nodejs_compat"]
  compatibility_date = "2025-12-26"
  pages_build_output_dir = "./dist"
  ```
- **`package.json` scripts** :
  ```json
  "build.server": "vite build -c adapters/cloudflare-pages/vite.config.ts",
  "deploy": "wrangler pages deploy ./dist"
  ```

### 4. Template `entry.cloudflare-pages.tsx`
```tsx
import { createQwikCity, type PlatformCloudflarePages } from "@builder.io/qwik-city/middleware/cloudflare-pages";
import qwikCityPlan from "@qwik-city-plan";
import render from "./entry.ssr";

const fetch = createQwikCity({ render, qwikCityPlan });

export { fetch };
export type { PlatformCloudflarePages };
```

### 5. Build & Validation
```bash
bun run build
```
- Vérifie `dist/_worker.js` et `dist/_routes.json`
- Teste les locales : `curl -A "Mozilla" https://<url>/fr/` (doit retourner `<html lang="fr-FR">`)

### 6. Déploiement
- **Option 1 : wrangler** (nécessite auth)
  ```bash
  bun run deploy
  ```
- **Option 2 : Git integration** (recommandé)
  - Build command : `bun build`
  - Output directory : `dist`
  - Variable d'environnement : `NODE_VERSION = 22` (ou ta version locale)

### 7. Dépannage
| Problème | Cause | Solution |
|---|---|---|
| 403 "Just a moment..." | Bot Fight Mode activé | Désactive dans CF Dashboard > Settings > Bot Fight Mode = Off |
| `<html lang="en-US">` partout | Locale non résolue | Vérifie `extractBase()` dans `entry.ssr.tsx` et `qwikCityPlan` |
| Build échoue sur `qwikCityPlan` | Module virtuel manquant | Ajoute `@qwik-city-plan` dans `rollupOptions.input` |
| Node version mismatch | CF utilise v16 par défaut | Ajoute `NODE_VERSION` dans CF Dashboard > Environment Variables |
| 404 sur `/build/*` | `_routes.json` mal configuré | Vérifie `exclude: ["/build/*", "/assets/*"]` |

## Exemples d'utilisation
```bash
# Installer l'adapter
bun run qwik add cloudflare-pages

# Build pour production
bun run build

# Déployer via wrangler (nécessite auth)
bun run deploy

# Tester les locales après déploiement
curl -A "Mozilla" https://<url>/fr/ | grep "<html lang=\"fr-FR\"")
```

## Vérifications post-déploiement
- [ ] `dist/_worker.js` existe et exporte `fetch`
- [ ] `dist/_routes.json` contient `"exclude": ["/build/*", "/assets/*"]`
- [ ] `<html lang="fr-FR">` sur `/fr/`, `<html lang="en-US">` sur `/en/`
- [ ] Pas de 403/404 sur les assets (`/build/*`)
- [ ] `NODE_VERSION` configurée dans CF Dashboard si node locale ≠ v16

## Anti-Patterns
- ❌ Utiliser `@qwik.dev/router/middleware/cloudflare-pages` (namespace incorrect)
- ❌ Oublier `qwikCityPlan` dans `createQwikCity` (casse le routing)
- ❌ Ne pas tester avec un User-Agent navigateur (CF bloque curl sans UA)
- ❌ Déployer sans `NODE_VERSION` si node locale ≠ v16 (build cassé)
- ❌ Modifier `_routes.json` manuellement sans comprendre les implications SSR/SSG