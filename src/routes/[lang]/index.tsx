import {
	$,
	component$,
	Resource,
	useContext,
	useResource$,
	useSignal,
	useStore,
} from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { inlineTranslate, type Translation } from "qwik-speak";
import FoodItem from "~/components/FoodItem";
import SearchBox from "~/components/SearchBox";
import { Title } from "~/components/Title";
import { AllergiesContext } from "~/contexts/allergies-context";
import { menu, type Item } from "~/data/newmenu";
import promptIa from "~/scripts/openIa";

// Flatten the { entrees, plats, desserts } sub-arrays into a single Item[] for search/display.
const flatMenu: Item[] = [
	...(menu.entrees ?? []),
	...(menu.plats ?? []),
	...(menu.desserts ?? []),
];

const serverIa = server$(async (prompt: string) => {
	const responseIa = await promptIa(prompt);
	const regex: string[] = (await responseIa.match(/\b\d+\b/g)) ?? [];
	const matches = flatMenu.filter((e) => regex.includes(e.id.toString()));
	return matches;
});

export default component$(() => {
	const t = inlineTranslate();
	const menuTranslations = t<Translation>("menu");

	const search = useStore({ InputBox: "" });
	// allergiesContext is typed Signal<Allergie[]>, so .value is Allergie[] (fixes TS2551).
	const allergiesContext = useContext(AllergiesContext);
	const lastQuery = useSignal<string>("");

	const menuResource = useResource$<Item[]>(async ({ track }) => {
		const query = track(() => lastQuery.value);
		const selectedAllergies = track(() => allergiesContext.value);

		let results: Item[];
		if (!query.trim()) {
			results = flatMenu;
		} else {
			try {
				results = await serverIa(query);
			} catch (error) {
				console.error("Erreur lors du filtrage IA:", error);
				throw error;
			}
		}

		// Exclude dishes whose allergenes array intersects the selected allergies.
		if (selectedAllergies.length > 0) {
			results = results.filter((item) => {
				const itemAllergenes = item.allergenes ?? [];
				return !itemAllergenes.some((a) => selectedAllergies.includes(a));
			});
		}

		return results;
	});

	const menuTranslationsRef = menuTranslations;

	const handleSearch = $(async (query: string) => {
		lastQuery.value = query.trim();
		search.InputBox = query.trim();
	});

	return (
		<div style={{ padding: "2rem" }}>
			<Title text={t("home.title@@Bienvenue sur notre site")} />
			<Title text={t("home.title2@@voyage")} />
			<h4>
				{allergiesContext.value.length > 0
					? allergiesContext.value.join(", ")
					: "Aucune allergie sélectionnée"}
			</h4>
			<SearchBox onSearch={handleSearch} isLoading={menuResource.loading} />

			{search.InputBox && (
				<p style={{ marginBottom: "1rem", color: "#666" }}>
					{t("search.resultsFor@@Résultats pour")}:{" "}
					<strong>{search.InputBox}</strong>
				</p>
			)}

			<Resource
				value={menuResource}
				onPending={() => <p>Chargement des recommandations IA...</p>}
				onRejected={(error) => (
					<p style={{ color: "red" }}>
						Une erreur est survenue lors de la recherche : {error.message}
					</p>
				)}
				onResolved={(filteredMenu) => {
					if (filteredMenu.length === 0) {
						return <p>Aucun plat ne correspond à vos critères.</p>;
					}

					return (
						<>
							{filteredMenu.map((item) => {
								const translation = menuTranslationsRef[item.id] as
									| {
											name: string;
											description: string;
									  }
									| undefined;

								return (
									<FoodItem
										key={item.id}
										name={translation?.name || item.nom}
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
