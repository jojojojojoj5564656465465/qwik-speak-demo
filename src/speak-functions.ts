import { server$ } from "@builder.io/qwik-city";
import type { LoadTranslationFn, TranslationFn } from "qwik-speak";

/**
 * Chargement paresseux des fichiers de traduction qwik-speak côté serveur.
 *
 * Pourquoi `import.meta.glob` avec ?raw et eager: true ?
 *  - `?raw` : on importe le contenu brut (string JSON) plutôt que le JSON parsé
 *             par Vite, ce qui permet à qwik-speak de contrôler totalement le parsing.
 *  - `eager: true` : on preload TOUS les fichiers i18n au démarrage du server
 *                    (pas de latence réseau au moment de `t()`). Puisque les
 *                    fichiers sont petits, le surcoût est négligeable.
 *  - Pattern /public/i18n/<lang>/<asset>.json (globs récursif de Vite) :
 *    match fr/menu.json, fr/runtime.json, en/menu.json, etc.
 *
 * Une fois chargée, chaque chaîne JSON est cachée dans `translationData` (registry
 * module-scope) puis servie à la demande par asset/locale.
 *
 * IMPORTANT : ce code ne tourne que côté serveur (server$). Le parsing JSON
 * n'est donc jamais fait côté client.
 */
const translationData = import.meta.glob<string>("/public/i18n/**/*.json", {
	query: "?raw",
	import: "default",
	eager: true,
});

/**
 * Fonction effectivement appelée par qwik-speak quand une traduction manque
 * dans le cache courant. Renvoie l'objet JSON parsé pour une (lang, asset) donné.
 *
 * Ex : loadTranslation$(`fr`, `menu`) retourne le contenu de
 *      public/i18n/fr/menu.json (les 91 items du menu nom + description).
 *
 * Le wrapping server$ garantit que cette exécution reste serveur-side : aucun
 * code de parsing ni accès au filesystem n'est inclus dans le bundle client.
 */
const loadTranslation$: LoadTranslationFn = server$(
	(lang: string, asset: string) =>
		JSON.parse(translationData[`/public/i18n/${lang}/${asset}.json`]),
);

export const translationFn: TranslationFn = {
	loadTranslation$: loadTranslation$,
};
