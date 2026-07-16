import {
	component$,
	isDev,
	useSignal,
	useContextProvider,
} from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { useQwikSpeak } from "qwik-speak";
import { RouterHead } from "./components/router-head/router-head";
import { AllergiesContext } from "./contexts/allergies-context";
import type { Allergie } from "./data/newmenu";
import { config } from "./speak-config";
import { translationFn } from "./speak-functions";
import "./global.css";

/**
 * Composant racine de l'application Qwik.
 *
 * Deux concerns majeurs y sont initialisés UNE FOIS pour toute l'application :
 *
 * 1. qwik-speak (i18n multilingue fr/en/es)
 *    useQwikSpeak injecte le translator `t()` et les hooks qwik-speak
 *    (useFormatNumber, useSpeakLocale, useTranslate...) dans toute l'arbre.
 *    Chargement des assets i18n se fait via translationFn (speak-functions.ts)
 *    et la liste des locales supportées via config (speak-config.ts).
 *    Documentation : https://github.com/dario-elements/qwik-speak
 *
 * 2. AllergiesContext — l'état global du FILTRE d'allergènes
 *    Un Signal<Allergie[]> est créé ici et fourni via useContextProvider.
 *    C'est l'unique source de vérité pour les allergènes exclus :
 *      - Le composant <CheckBox/> (layout.tsx) MUT cet état (coche/décoche)
 *      - La route [lang]/index.tsx LE LIT pour filtrer le menu via useResource$
 *    Rôle de la racine : garantir que les composants sans relation parent/enfant
 *    directe (navbar vs page courante) partagent bien le MÊME signal réactif.
 *
 * Note Qwik — Resumability : pas d'hydratation ici. L'état `allergies` est
 * sérialisé dans le HTML SSR puis repris côté client sans surcoût.
 */
export default component$(() => {
	// Initialise qwik-speak : translator + locales supportées + loader.
	useQwikSpeak({ config, translationFn });

	// État global du filtre d'allergènes (partagé via contexte Qwik).
	// Vide au démarrage = aucun allergène exclu = menu complet affiché.
	const allergies = useSignal<Allergie[]>([]);

	// Rend ce signal accessible à toute l'arborescence via useContext().
	// Création UNE seule fois ici pour conserver l'état entre navigations.
	useContextProvider(AllergiesContext, allergies);

	return (
		<QwikCityProvider>
			<head>
				<meta charset="utf-8" />
				{/* Le manifest.json est auto-généré uniquement en production
				    (isDev est false après `bun build`). */}
				{!isDev && (
					<link
						rel="manifest"
						href={`${import.meta.env.BASE_URL}manifest.json`}
					/>
				)}
				<RouterHead />
			</head>
			<body>
				{/* Point de sortie du routeur Qwik City (DFS dans src/routes/). */}
				<RouterOutlet />
			</body>
		</QwikCityProvider>
	);
});
