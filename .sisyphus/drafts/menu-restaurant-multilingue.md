# Draft: Menu Restaurant Multilingue

## État actuel
- qwik-speak ^0.24.0 installé et configuré
- 3 langues : fr, en, es (fr = défaut)
- Routes i18n sous `/[lang]/`
- Pattern existant : page About sert de référence

## À faire
1. Ajouter l'asset "menu" dans speak-config.ts
2. Créer les fichiers de traduction public/i18n/{fr,en,es}/menu.json
3. Créer la route src/routes/[lang]/menu/index.tsx
4. Ajouter le lien "Menu" dans la navigation layout.tsx
5. Extraire les clés de traduction via la commande d'extraction

## Questions en attente
- Contenu du menu ? (noms des plats, descriptions, sections)
- Style de la page ?
