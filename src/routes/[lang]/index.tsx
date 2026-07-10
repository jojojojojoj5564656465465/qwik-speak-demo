import {
	$,
	component$,
	useResource$,
	useSignal,
	Resource,
} from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { inlineTranslate, type Translation } from "qwik-speak";
import FoodItem from "~/components/FoodItem";
import SearchBox from "~/components/SearchBox";
import { Title } from "~/components/Title";

import menu from "~/data/menu";
import promptIa from "~/scripts/openIa";

// Fonction serveur qui appelle l'IA et filtre le menu local
const serverIa = server$(async (prompt: string) => {
	const responseIa = await promptIa(prompt);
	const regex: string[] = (await responseIa.match(/\b\d+\b/g)) ?? [];
	const matches = menu.filter((e) => regex.includes(e.id.toString()));
	return matches;
});

export default component$(() => {
	const t = inlineTranslate();
	const menuTranslations = t<Translation>("menu");

	// Le signal de recherche devient notre unique source de vérité réactive
	const lastQuery = useSignal<string>("");

	// Hook useResource$ : il se déclenche automatiquement dès que sa dépendance trackée change
	const menuResource = useResource$<typeof menu>(async ({ track }) => {
		// On demande à Qwik de surveiller les changements de lastQuery
		const query = track(() => lastQuery.value);

		// Comportement par défaut : si la barre de recherche est vide, on renvoie tout le menu
		if (!query.trim()) {
			return menu;
		}

		try {
			// Appel de la fonction serveur avec le prompt utilisateur
			return await serverIa(query);
		} catch (error) {
			console.error("Erreur lors du filtrage IA:", error);
			throw error; 
		}
	});

	// Sauvegarde de la référence de traduction pour éviter les problèmes de portée
	const menuTranslationsRef = menuTranslations;

	// La fonction de recherche n'a plus besoin de faire d'appel API impératif,
	// elle met simplement à jour le signal, ce qui réveille automatiquement `useResource$`.
	const handleSearch = $(async (query: string) => {
		lastQuery.value = query.trim();
	});

	return (
		<div style={{ padding: "2rem" }}>
			<Title text={t("home.title@@Bienvenue sur notre site")} />
			<Title text={t("home.title2@@voyage")} />

			{/* menuResource.loading passe à true automatiquement pendant les appels asynchrones */}
			<SearchBox onSearch={handleSearch} isLoading={menuResource.loading} />

			{lastQuery.value && (
				<p style={{ marginBottom: "1rem", color: "#666" }}>
					{t("search.resultsFor@@Résultats pour")}:{" "}
					<strong>{lastQuery.value}</strong>
				</p>
			)}

			{/* Gestionnaire d'état asynchrone déclaratif de Qwik */}
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
										name={translation?.name || "Nom indisponible"}
										description={
											translation?.description || "Description indisponible"
										}
										src={item.src}
										price={item.price}
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