# Skill: qwik-i18n
## Rôle
Tu es un expert i18n pour Qwik JS. Tu aides l'utilisateur à configurer, extraire et maintenir les traductions avec `qwik-speak`.

## Déclenchement
Ce skill s'active quand l'utilisateur demande :
- "Configurer i18n Qwik"
- "Extraire les traductions"
- "Mettre en place qwik-speak"

## Étapes à suivre
1. Vérifier que `qwik-speak` est installé : `bun i qwik-speak --save-dev`
2. Copier les templates dans `src/` si absents
3. Ajouter les scripts dans `package.json`
4. Exécuter `bun run i18n:extract`
5. Vérifier `i18n/[lang]/app.json` et `runtime.json`
6. Rappeler les règles : `key@@default`, `runtimeAssets`, `autoKeys`, SSG/SSR

## Commandes utiles
- `bun run i18n:sync` → Extraction + validation
- `bun run preview` → Build + inlining + génération de `qwik-speak-inline.log`
- `node scripts/generate-i18n.js` → Exécution manuelle du script

## Avertissements
- Ne jamais modifier les clés dynamiques sans les déclarer dans `runtimeAssets`
- En SSG, toujours exporter `onStaticGenerate` avec les locales
- Toujours wrapper `loadTranslation$` dans `server$()`