/**
 * Source de vérité unique pour les types liés aux allergènes.
 *
 * Centraliser `Allergie` ici évite les imports circulaires :
 *   - `components/CheckBox/index.tsx` (consommateur + validator)
 *   - `data/newmenu.ts` (structure du menu)
 *   - `contexts/allergies-context.tsx` (type porté par le contexte Qwik)
 *   - `root.tsx` (initialisation du store)
 *   - `routes/[lang]/index.tsx` (filtre du menu)
 *
 * `Allergie` est un union de chaînes littérales : par construction, les clés
 * de `ALLERGIE_Store` (root.tsx) et de `public/i18n/<lang>/allergies.json`
 * DOIVENT exactement matcher cette union. Toute incohérence remonte en
 * erreur de compilation TypeScript.
 */
import * as a from "@arrirpc/schema";

/**
 * Union des clés d'allergènes. Maintenir cette liste synchronisée avec :
 *   - les clés du store `ALLERGIE_Store` dans `src/root.tsx`
 *   - les clés de `public/i18n/<lang>/allergies.json`
 *   - `item.allergenes` dans `src/data/newmenu.ts`
 */
export const AllergiesSchema = a.enumerator([
	"gluten",
	"lactose",
	"arachide",
	"fruits-a-coque",
	"soja",
	"poisson",
	"crustaces",
	"moutarde",
	"sesame",
	"sulfites",
]);
export const AllergiesArray= AllergiesSchema.enum;




export const $$Allergie = a.compile(AllergiesSchema);

export type Allergie = a.a.infer<typeof AllergiesSchema>;


export interface AllergenEntry {
	active: boolean;
}

export type AllergiesStore = Record<Allergie, AllergenEntry>;
