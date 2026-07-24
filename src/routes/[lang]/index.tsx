import { a } from "@arrirpc/schema";
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
const MenuSchema = a.object({
	nom: a.string(),
	description: a.string(),
});

const serverIa = server$(async (prompt: string) => {
	const responseIa = await promptIa(prompt);
	const matchedIds: string[] = responseIa.match(/\b\d+\b/g) ?? [];
	return flatMenu.filter((item) => matchedIds.includes(item.id.toString()));
});


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

export default component$(() => {
	const t = inlineTranslate();
	const menuTranslations = t<Translation>("menu");


	const search = useStore({ inputBox: "" });
	
	const allergiesContext = useContext(AllergiesContext);
	const lastQuery = useSignal<string>("");


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
			<Title text={t("home.title@@voyage")} />

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

			<Resource
				value={menuResource}
				onPending={() => <p>{t("search.loading@@Chargement des recommandations...")}</p>}
				onRejected={(error) => (
					<p style={{ color: "red" }}>
						{/* TODO i18n : cette string est en dur. Devrait être t("search.error"). */}
						Une erreur est survenue lors de la recherche : {error.message}
					</p>
				)}
				onResolved={(filteredMenu) => {
					if (filteredMenu.length === 0) {
						// TODO i18n : "Aucun plat ne correspond..." en dur.
						return <p>{t("search.noResults@@Aucun plat ne correspond à vos critères.")}</p>;
					}

					return (
						<>
							{filteredMenu.map((item) => {
								const result = a.parse(
									MenuSchema,
									menuTranslations[item.id],
								);
								
								const translation = result.success ? result.value : null;

								return (
									<FoodItem
										key={item.id}
										name={translation?.nom || item.nom}
										description={
											translation?.description || item.description
										}
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


