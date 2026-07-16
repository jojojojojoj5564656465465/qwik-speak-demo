/**
 * Configuration qwik-speak — l'i18n multilingue du projet speek.
 *
 * Trois locales sont supportées : français (défaut), anglais, espagnol.
 * Les fichiers de traduction vivent dans public/i18n/<lang>/<asset>.json.
 *
 * Champs clés :
 * - defaultLocale : redirigée automatiquement si la locale de l'URL est invalide
 *                  (voir onRequest dans src/routes/[lang]/layout.tsx).
 * - supportedLocales : doivent matcher avec le dossier i18n/. Une locale non listée ici
 *                  et présente dans public/i18n/ sera IGNORE par qwik-speak.
 * - assets : noms de fichiers chargés au runtime via translationFn.loadTranslation$.
 *            `"menu"` → public/i18n/<lang>/menu.json (91 items du menu traduits).
 *            `"runtime"` est une runtimeAsset : chargée paresseusement, jamaisbundle.
 * - runtimeAssets : chargées séparément via import.meta.glob + ?raw (voir speak-functions.ts),
 *                    non incluses dans le bundle initial.
 *
 * Surface API qwik-speak : https://github.com/dario-elements/qwik-speak
 */
import type { SpeakConfig } from "qwik-speak";

export const config: SpeakConfig = {
  defaultLocale: { lang: "fr" },
  supportedLocales: [{ lang: "fr" }, { lang: "en" }, { lang: "es" }],
  // Assets chargées à chaque navigation de locale. Chaque entrée correspond à un
  // fichier JSON dans public/i18n/<lang>/<asset>.json. Les ajouter ici est
  // nécessaire MAIS il faut aussi que les fichiers existent réellement (cf. fr/).
  assets: ["app", "home", "about", "menu"],
  // runtime_assets contiennent des chaînes "runtime" (format monétaire, dates, etc.)
  // chargées séparément pour ne pas alourdir le bundle client initial.
  runtimeAssets: ["runtime"],
};
