# DATA KNOWLEDGE BASE

**Generated:** 2026-08-02

## OVERVIEW

Static menu data and AI integration scripts. Centralized data layer feeding the main page component.

## STRUCTURE

```
data/
├── newmenu.ts        # Main menu data (1038 lines, 91 dishes)
├── newmenu.json      # JSON export of menu (for reference/distribution)
├── bestAnswer.json   # Pre-computed AI query → dish ID mappings
└── food.txt          # Raw text menu data (legacy/source)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add/menu item | `data/newmenu.ts` | Add to `entrees`, `plats`, or `desserts` array |
| Update AI prompt | `scripts/openIa.ts` | `MENU_SYSTEM_PROMPT` string (line 21) |
| View raw data | `data/food.txt` | Original unstructured menu text |

## CONVENTIONS

- **Menu schema**: `Item` interface requires `id`, `nom`, `description`, `prix`. `allergenes` and `src` are optional.
- **Type safety**: `menu` object uses `satisfies Menu` — adding fields without updating the type causes compile errors.
- **Allergen type derivation**: `Allergie` union in `types/allergies.ts` is the source of truth — menu `allergenes` arrays must match.
- **AI system prompt**: The full menu is embedded as a "Toon"-formatted string in `openIa.ts` for the NVIDIA model context. Do NOT modify `newmenu.ts` without also updating the prompt if dish IDs shift.

## ANTI-PATTERNS

- **DO NOT** add dishes to `newmenu.ts` without assigning unique sequential IDs — AI prompt references specific IDs.
- **DO NOT** change allergene names in `newmenu.ts` without also updating `types/allergies.ts` `AllergiesArray`.
- **DO NOT** use `console.log` in `scripts/openIa.ts` for production — these run server-side and will appear in logs.
