import {
	$,
	component$,
	Resource,
	useContext,
	useResource$,
	useSignal,
	useStore,
} from "@builder.io/qwik";
// server$ : wrapper Qwik qui force l'exécution d'une fonction CÔTÉ SERVEUR.
// Le code wrappé n'est jamais inclus dans le bundle client (sécurité + perfs).
import { server$ } from "@builder.io/qwik-city";
// inlineTranslate (alias `t`) : API principale qwik-speak ; `Translation` est
// un type utilitaire pour typer les valeurs traduites qu'on récupère via t().
import { inlineTranslate, type Translation } from "qwik-speak";
import FoodItem from "~/components/FoodItem";
import SearchBox from "~/components/SearchBox";
import { Title } from "~/components/Title";
// AllergiesContext : le Signal global du filtre (provider dans root.tsx).
// useContext retourne le MÊME signal partagé — d'où la réactivité sans props.
import { AllergiesContext } from "~/contexts/allergies-context";
// menu + types : la source de vérité des plats. Les prix/id/allergenes
// viennent du TS ; seuls nom+description sont traduits via qwik-speak.
import { type Allergie, type Item, menu } from "~/data/newmenu";
// promptIa : appel au modèle de langage NVIDIA pour filtrage sémantique.
import promptIa from "~/scripts/openIa";

// Aplatit { entrees, plats, desserts } en un seul tableau Item[]
// pour la recherche et l'affichage. Les boissons sont exclues volontairement
// car elles ne portent pas d'allergènes dans le modèle de données.
const flatMenu: Item[] = [
	...(menu.entrees ?? []),
	...(menu.plats ?? []),
	...(menu.desserts ?? []),
];

/**
 * Endpoint serveur : recherche sémantique via l'IA NVIDIA.
 *
 * server$ garantit que :
 *   - `promptIa` (clé API NVIDIA, etc.) ne JAMAIS fuiter côté client
 *   - Le modèle (food.txt) reste serveur-side
 *   - Le parsing de la réponse texte ne s'exécute pas sur le téléphone du user
 *
 * Algorithme :
 *   1. Envoie le prompt utilisateur à l'IA.
 *   2. Récupère une réponse texte contenant des IDs séparés par des virgules
 *      (ex: "1, 5, 12, 31"). On utilise une regex pour extraire les entiers.
 *   3. Filtre le flatMenu pour ne garder que les items dont l'id matche.
 *
 * Regex `\b\d+\b` :
 *   - \b : frontière de mot (exclut les IDs collés à autre chose)
 *   - \d+ : au moins un chiffre
 *   - g : tous les matches (sinon juste le premier)
 */
const serverIa = server$(async (prompt: string) => {
	const responseIa = await promptIa(prompt);
	const matchedIds: string[] = responseIa.match(/\b\d+\b/g) ?? [];
	return flatMenu.filter((item) => matchedIds.includes(item.id.toString()));
});

/**
 * Exclude par allergènes — cœur du FILTRE côté client.
 *
 * Pure function : ne mute pas `items`, retourne un NOUVEAU tableau.
 * Early return si la liste d'exclus est vide : évite meme le `filter()` et
 * retourne la même référence (gain perfs + évite un re-render inutile).
 *
 * Pourquoi `some` et pas `every` ?
 * On EXCLUT un plat dès qu'1 seul de ses allergènes est dans la liste noire.
 * Si on voulait exclure seulement les plats qui cumulent PLUSIEURS allergènes
 * exclus, il faudrait `every`.
 *
 * Cette fonction est DUPLIQUÉE dans le code mort supprimé (Filter.tsx CheckBox)
 * et le Filter.tsx script. C'EST la canonical version utilisée en prod.
 */
function excludeByAllergies(
	items: Item[],
	excludedAllergies: readonly Allergie[],
): Item[] {
	if (excludedAllergies.length === 0) return items;

	return items.filter((item) => {
		const itemAllergenes = item.allergenes ?? [];
		return !itemAllergenes.some((a) => excludedAllergies.includes(a));
	});
}

/**
 * Route /<lang>/ — page d'accueil du menu filtré.
 *
 * Composition :
 *   <Title>              → titres traduits via t("home.title2@@voyage")
 *   <SearchBox>          → input de recherche IA (debounce 3500 ms)
 *   <Resource>           → wrapper Qwik pour async + états (pending/resolved/rejected)
 *     └ onResolved →  <FoodItem> * n (carte de plat)
 *
 * Flux de données RÉACTIF :
 *
 *   user tape "vegan"
 *      ↓ (debounce SearchBox 3500ms)
 *   handleSearch(query) → lastQuery.value = query
 *      ↓ (track lastQuery dans useResource$)
 *   useResource$ re-démarre
 *      ├ empty query  → return flatMenu (menu complet)
 *      └ else         → await serverIa(query)  // serveur IA
 *   results → excludeByAllergies(results, allergiesContext.value)
 *      ↑                                     ↑
 *      └──── track(allergiesContext.value) ───┘  (filtre case-à-cocher)
 *
 * Double tracking : search + allergènes. Le useResource$ se relance si l'UN OU
 * l'AUTRE change. Pas besoin de coordination manuelle — Qwik s'en occupe.
 */
export default component$(() => {
	const t = inlineTranslate();
	// Récupère TOUTES les traductions "menu" pour la locale active.
	// Typé `Translation` (foreign de qwik-speak) ; structure :
	// { "1": {name, description}, "2": {...}, ... } → cf public/i18n/<lang>/menu.json
	// ATTENTION BUG : les fichiers en/menu.json et es/menu.json existent
	// mais contiennent DU FRANÇAIS (copié-collé non traduit). À corriger.
	const menuTranslations = t<Translation>("menu");

	// useStore : regroupe plusieurs champs d'état non-réactifs-à-l'item-près.
	// Ici on stocke juste la dernière requête brute affichée (feedback utilisateur).
	const search = useStore({ inputBox: "" });
	// Signal source du tracking useResource$. focus sur CHANGEMENT de valeur
	// (pas sur l'identité) : Qwik le compare au rendu précédent.
	const allergiesContext = useContext(AllergiesContext);
	// Dernière requête servant de déclencheur au useResource$ (zás search).
	// Initialisée à "" = écran vierge = tout le menu affiché au chargement.
	const lastQuery = useSignal<string>("");

	/**
	 * useResource$ — équivalent Qwik de use(RxJS) / React Suspense.
	 * Retourne une ressource async avec 3 états : pending | resolved | rejected.
	 *
	 * track() à l'intérieur :
	 *   - track(() => lastQuery.value)      → relance si la recherche change
	 *   - track(() => allergiesContext.value) → relance si les allergènes exclus changent
	 * Automatiquement, Qwik définit ce qui trigger le re-run de useResource$.
	 * Pas de useEffect, pas de dépendances "à la React" : le tracking est
	 * déterminé par les APPELS EFFECTIFS à track(...).
	 */
	const menuResource = useResource$<Item[]>(async ({ track }) => {
		const query = track(() => lastQuery.value);
		const excludedAllergies = track(() => allergiesContext.value);

		let results: Item[];

		if (!query.trim()) {
			// Pas de requête utilisateur → on affiche le menu complet (avant filtre).
			results = flatMenu;
		} else {
			try {
				// Recherche sémantique via l'IA NVIDIA côté serveur.
				results = await serverIa(query);
			} catch (error) {
				// console.error est OK ici (côté serveur, dans un catch,
				// pour diagnostiquer une vraie panne réseau). À noter que
				// AGENTS.md interdit console.log en prod, mais console.error
				// dans un catch serveur est tolérée pour le diagnostic.
				console.error("Erreur lors du filtrage IA:", error);
				throw error;
			}
		}

		// Combiner le résultat IA avec le filtre d'allergènes checkBox.
		// Deux filtres orthogonaux (sémantique + allergènes) s'appliquent ensemble.
		return excludeByAllergies(results, excludedAllergies);
	});

	/**
	 * handleSearch — appelé par <SearchBox/> (QRL serializable via $()).
	 * Met à jour deux états :
	 *   - lastQuery (trigger useResource$)
	 *   - search.inputBox (affiché dans "Résultats pour <strong>X</strong>")
	 */
	const handleSearch = $(async (query: string) => {
		const trimmed = query.trim();
		lastQuery.value = trimmed;
		search.inputBox = trimmed;
	});

	return (
		<div style={{ padding: "2rem" }}>
			{/* Titres traduits via qwik-speak. Syntax `@@` : clé i18n || fallback. */}
			<Title text={t("home.title@@Bienvenue sur notre site")} />
			<Title text={t("home.title2@@voyage")} />

			<SearchBox onSearch={handleSearch} isLoading={menuResource.loading} />

			{/* Affiché seulement si l'utilisateur a tapé qqch. Évite le bruit au 1er rendu. */}
			{search.inputBox && (
				<p style={{ marginBottom: "1rem", color: "#666" }}>
					{t("search.resultsFor@@Résultats pour")}:{" "}
					<strong>{search.inputBox}</strong>
				</p>
			)}

			{/* Rappel du filtre actif. TODO i18n : "Allergènes exclus :" est en dur.
			    Devrait être t("search.excludedAllergies@@<fallback>"). */}
			{allergiesContext.value.length > 0 && (
				<p
					style={{ marginBottom: "1rem", color: "#c62828", fontSize: "0.9rem" }}
				>
					Allergènes exclus :{" "}
					<strong>{allergiesContext.value.join(", ")}</strong>
				</p>
			)}

			{/**
			 * <Resource> : wrapper déclaratif pour une valeur async.
			 * On fournit les 3 rendus possibles :
			 *   - onPending   : chargement en cours → "Chargement des recommandations..."
			 *   - onRejected  : une erreur s'est produite → message rouge
			 *   - onResolved  : succès → map des FoodItem
			 *
			 * Important : onResolved ne reçoit que la VALEUR resolue. Pas de
			 * gestion d'état manuelle (loading/error) comme avec useEffect.
			 */}
			<Resource
				value={menuResource}
				onPending={() => <p>Chargement des recommandations...</p>}
				onRejected={(error) => (
					<p style={{ color: "red" }}>
						{/* TODO i18n : cette string est en dur. Devrait être t("search.error"). */}
						Une erreur est survenue lors de la recherche : {error.message}
					</p>
				)}
				onResolved={(filteredMenu) => {
					if (filteredMenu.length === 0) {
						// TODO i18n : "Aucun plat ne correspond..." en dur.
						return <p>Aucun plat ne correspond à vos critères.</p>;
					}

					return (
						<>
							{filteredMenu.map((item) => {
								// Récupère la traduction nom+description via l'id du plat.
								// `as` est un cast parce que Translation est structuré
								// en `{ [id]: { name, description } }` mais qwik-speak
								// expose d'abord une fonction t<Translation>("menu").
								// Note : les fichiers i18n utilisent les clés "nom" et
								// "description" en français, mais on lit ici ".name" et
								// ".description". C'est un BUG : les fichiers en/es
								// contiennent du français non traduit.
								const translation = menuTranslations[item.id] as
									| { nom: string; description: string }
									| undefined;

								// Fallback si la traduction manque : on affiche le `nom`
								// du menu TS (qui est lui-même en français côté newmenu.ts).
								// Pour un vrai multilingue, il faudrait traduire newmenu.ts
								// en créant des variantes en/es, ou bien s'assurer que les
								// fichiers public/i18n/<lang>/menu.json contiennet la vraie
								// traduction et sont utilisés sans fallback.
								return (
									<FoodItem
										key={item.id}
										name={translation?.nom || item.nom}
										description={translation?.description || item.description}
										src={item.src}
										price={item.prix}
									/>
								);
							})}
						</>
					);
				}}
			/>
		</div>
	);
});
