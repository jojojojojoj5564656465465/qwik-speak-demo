---
skill: qwik-speak-i18n
name: qwik-i18n
description: >
  Installation, configuration, extraction, routing et déploiement de l'i18n dans Qwik City.
  Inclut les scripts d'automatisation, les bonnes pratiques et les pièges à éviter.
triggers:
  - i18n
  - traduction
  - langue
  - multilingue
  - qwik-speak
  - speak
  - localize
---

## 📦 Installation
```bash
bun install qwik-speak --save-dev
```

## 🧱 Structure des fichiers (standard)
```
src/
├── speak-config.ts
├── speak-functions.ts
├── root.tsx                ← OBLIGATOIRE : useQwikSpeak
├── entry.ssr.tsx           ← Base URL + attribut lang
├── routes/
│   ├── plugin.ts
│   ├── index.tsx           ← redirection / → /langue/
│   ├── [lang]/
│   │   ├── layout.tsx      ← validation de la langue
│   │   ├── index.tsx
│   │   └── ...
│   └── ... (autres pages)
├── components/
│   └── language-selector/
│       └── index.tsx
└── global.css
public/i18n/
  fr/app.json
  en/app.json
  es/app.json
  fr/runtime.json  (si utilisé)
  ...
```

---

## ⚙️ 1. Configuration Speak (`speak-config.ts`)
```ts
import type { SpeakConfig } from 'qwik-speak';

export const config: SpeakConfig = {
  defaultLocale: { lang: 'fr' },   // langue par défaut (ex: fr)
  supportedLocales: [
    { lang: 'fr' },
    { lang: 'en' },
    { lang: 'es' }
  ],
  assets: ['app'],                 // trads chargées partout
  runtimeAssets: ['runtime']       // clés dynamiques (optionnel)
};
```

## 📨 2. Fonctions de chargement (`speak-functions.ts`)
```ts
import { server$ } from '@builder.io/qwik-city';
import type { LoadTranslationFn, Translation, TranslationFn } from 'qwik-speak';

// Version recommandée (Edge/SSG/SSR) – bundling eager + raw
const translationData = import.meta.glob('/public/i18n/**/*.json', {
  as: 'raw',
  eager: true,
});

const loadTranslation$: LoadTranslationFn = server$((lang: string, asset: string) =>
  JSON.parse(translationData[`/public/i18n/${lang}/${asset}.json`])
);

export const translationFn: TranslationFn = {
  loadTranslation$,
};
```

## 🧠 3. Provider global obligatoire (`root.tsx`)
```tsx
import { component$ } from '@builder.io/qwik';
import { QwikCityProvider, RouterHead } from '@builder.io/qwik-city';
import { useQwikSpeak } from 'qwik-speak';
import { config } from './speak-config';
import { translationFn } from './speak-functions';

export default component$(() => {
  // À placer AVANT QwikCityProvider
  useQwikSpeak({ config, translationFn });

  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        <RouterHead />
      </head>
      <body>
        <Slot />
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  );
});
```

## ⚡ 4. Plugin Vite (`vite.config.ts`)
```ts
import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { qwikSpeakInline } from 'qwik-speak/inline';

export default defineConfig(() => ({
  plugins: [
    qwikCity(),
    qwikVite(),
    qwikSpeakInline({
      supportedLangs: ['fr', 'en', 'es'],
      defaultLang: 'fr',
      assetsPath: 'public/i18n',
      autoKeys: true,     // active la génération automatique des clés si besoin
    }),
    // tsconfigPaths(), etc.
  ],
}));
```

## 🌐 5. Routage & détection de la langue

### `routes/plugin.ts` (middleware global)
```ts
import type { RequestHandler } from '@builder.io/qwik-city';
import { setSpeakContext, validateLocale } from 'qwik-speak';
import { config } from '../speak-config';

export const onRequest: RequestHandler = ({ params, locale, request }) => {
  let lang: string | undefined;

  // 1. extraire de l'URL
  if (params.lang && validateLocale(params.lang)) {
    lang = config.supportedLocales.find(l => l.lang === params.lang)?.lang;
  }

  // 2. fallback sur Accept-Language
  if (!lang) {
    const accept = request.headers.get('accept-language');
    if (accept) lang = accept.split(';')[0]?.split(',')[0];
    lang = config.supportedLocales.find(l => l.lang === lang)?.lang || config.defaultLocale.lang;
  }

  setSpeakContext(config);
  locale(lang!);
};
```

### `routes/index.tsx` (redirection de la racine)
```tsx
import { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ redirect }) => {
  throw redirect(302, '/fr/'); // redirige vers la langue par défaut
};
```

### `routes/[lang]/layout.tsx` (validation)
```tsx
import { component$, Slot } from '@builder.io/qwik';
import { type RequestHandler } from '@builder.io/qwik-city';
import { config } from '../../speak-config';

export const onRequest: RequestHandler = async ({ params, redirect }) => {
  if (!config.supportedLocales.find(l => l.lang === params.lang)) {
    throw redirect(302, `/${config.defaultLocale.lang}/`);
  }
};

export default component$(() => <Slot />);
```

## 🚀 6. SSR & base URL dynamique (`entry.ssr.tsx`)
```tsx
import { isDev } from '@builder.io/qwik/build';
import type { RenderOptions } from '@builder.io/qwik/server';
import { config } from './speak-config';

export function extractBase({ serverData }: RenderOptions): string {
  if (!isDev && serverData?.locale) {
    return '/build/' + serverData.locale;
  }
  return '/build';
}

export default function (opts: RenderToStreamOptions) {
  return renderToStream(<Root />, {
    ...opts,
    base: extractBase,
    containerAttributes: {
      lang: opts.serverData?.locale || config.defaultLocale.lang,
      ...opts.containerAttributes,
    },
  });
}
```

## ✍️ 7. Utilisation dans les composants

### Traduction simple + interpolation
```tsx
const t = inlineTranslate();
t('app.title@@Mon App');            // valeur par défaut après @@
t('home.greeting@@Bonjour {{name}}', { name: 'Paul' });
```

### DocumentHead traduit
```tsx
export const head: DocumentHead = () => {
  const t = inlineTranslate();
  return {
    title: t('home.head.title@@Accueil'),
    meta: [{ name: 'description', content: t('home.head.desc@@Description multilingue') }],
    links: [
      { rel: 'alternate', hreflang: 'fr', href: '/fr/' },
      { rel: 'alternate', hreflang: 'en', href: '/en/' },
      { rel: 'alternate', hreflang: 'x-default', href: '/fr/' },
    ],
  };
};
```

### Sélecteur de langue (avec `localizePath`)
```tsx
import { component$ } from '@builder.io/qwik';
import { useSpeakLocale, useSpeakConfig, localizePath } from 'qwik-speak';

export const LanguageSelector = component$(() => {
  const locale = useSpeakLocale();
  const config = useSpeakConfig();
  const getPath = localizePath();

  const handleChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    window.location.href = getPath(window.location.pathname, target.value);
  };

  return (
    <select onChange$={handleChange}>
      {config.supportedLocales.map((loc) => (
        <option key={loc.lang} value={loc.lang} selected={loc.lang === locale.lang}>
          {loc.lang.toUpperCase()}
        </option>
      ))}
    </select>
  );
});
```

## 🏗️ 8. Extraction automatique des clés

### Script npm
```json
"scripts": {
  "i18n:extract": "qwik-speak-extract --supportedLangs=fr,en,es --assetsPath=public/i18n --autoKeys=true --unusedKeys=true --runtimeAssets=runtime",
}
```
Lance-le après chaque ajout de `t('...')`.  
Les fichiers JSON sont créés/mis à jour dans `public/i18n/<langue>/`.

### Script de validation supplémentaire (`scripts/validate-i18n.js`)
*(Celui que tu avais, je l’ai légèrement enrichi)*
```js
import { readdirSync, existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const LANGS = ['fr', 'en', 'es'];
const ASSETS_DIR = 'public/i18n';
const REQUIRED_ASSETS = ['app', 'runtime'];

for (const lang of LANGS) {
  const langDir = join(ASSETS_DIR, lang);
  if (!existsSync(langDir)) mkdirSync(langDir, { recursive: true });

  for (const asset of REQUIRED_ASSETS) {
    const file = join(langDir, `${asset}.json`);
    if (!existsSync(file)) {
      writeFileSync(file, '{}');
      console.log(`✅ Créé : ${file}`);
    } else {
      try { JSON.parse(readFileSync(file, 'utf-8')); }
      catch {
        console.error(`❌ JSON invalide : ${file}`);
        process.exit(1);
      }
    }
  }
}
console.log('🌍 Tous les fichiers i18n sont valides.');
```

## 🔄 9. Workflow CI/CD (GitHub Actions)
```yaml
# .github/workflows/i18n-sync.yml
name: i18n Sync
on:
  push:
    paths: ['src/**/*.{tsx,ts}']
  workflow_dispatch:
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run i18n:extract
      - run: node scripts/validate-i18n.js
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "🌍 i18n: extraction automatique"
```

## 🧪 10. Tests unitaires (Vitest)
```tsx
import { createDOM } from '@builder.io/qwik/testing';
import { QwikSpeakMockProvider } from 'qwik-speak';
import Home from './index';
import { config } from '../speak-config';

test('rendu avec clé par défaut', async () => {
  const { screen, render } = await createDOM();
  await render(
    <QwikSpeakMockProvider config={config}>
      <Home />
    </QwikSpeakMockProvider>
  );
  expect(screen.outerHTML).toContain('Mon App');
});
```

## 📋 11. Récapitulatif des bonnes pratiques (checklist)

| ✅ | Bonne pratique |
|----|----------------|
| ☐ | `useQwikSpeak` dans `root.tsx` (avant `QwikCityProvider`) |
| ☐ | `base: extractBase` + `containerAttributes.lang` dans `entry.ssr.tsx` |
| ☐ | `locale(lang)` dans `plugin.ts` (obligatoire) |
| ☐ | `qwikSpeakInline` dans `vite.config.ts` (ordre : city → vite → speak) |
| ☐ | `loadTranslation$` en `server$` avec bundling eager si Edge/SSG |
| ☐ | `@@valeur par défaut` dans les clés pour l’extraction |
| ☐ | `assets` et `runtimeAssets` définis dans la config |
| ☐ | `<a>` (et non `<button>`) pour le changement de langue (rechargement) |
| ☐ | `localizePath()` pour construire les URLs localisées |
| ☐ | `DocumentHead` avec `inlineTranslate()` pour un titre traduit |
| ☐ | Extraction régulière (`npm run i18n:extract`) |
| ☐ | Le log `qwik-speak-inline.log` inspecté après le build |

## 🧭 12. Migration depuis un projet existant (ex: ton starter)
1. **Ajoute** `useQwikSpeak({ config, translationFn })` dans `root.tsx`.
2. **Remplace** le contenu de `entry.ssr.tsx` par la version avec `extractBase`.
3. **Utilise** la version eager/raw de `import.meta.glob` dans `speak-functions.ts` si tu prévois SSG/Edge.
4. **Active** `autoKeys: true` dans `qwikSpeakInline` et le script d’extraction.
5. **Mets à jour** le sélecteur de langue avec `localizePath()`.
6. **Exécute** `npm run i18n:extract`, remplis les JSON, puis lance `npm run build` ou `preview`.
