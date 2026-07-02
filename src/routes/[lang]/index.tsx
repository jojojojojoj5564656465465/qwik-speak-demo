import { $, component$, useSignal } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { inlineTranslate, type Translation } from "qwik-speak";
import FoodItem from "~/components/FoodItem";
import SearchBox from "~/components/SearchBox";
import { Title } from "~/components/Title";
import type  Menu  from "~/data/menu";
import menu from "~/data/menu";
import promptIa from "~/scripts/openIa";

const serverIa = server$(async (prompt: string) => {
	const responseIa = await promptIa(prompt);
	const regex: string[] = (await responseIa.match(/\b\d+\b/g)) ?? [];
	const matches = menu.filter((e) => regex.includes(e.id.toString()));
	return matches;
});

export default component$(() => {
	const t = inlineTranslate();
	const menuTranslations = t<Translation>("menu");

	const filteredMenu = useSignal<Menu[]>(menu);
	const isLoading = useSignal(false);
	const lastQuery = useSignal("");

	const menuTranslationsRef = menuTranslations;

	const handleSearch = $(async (query: string) => {
		isLoading.value = true;
		lastQuery.value = query;

		try {
			const result = await serverIa(query);
			filteredMenu.value = result;
		} catch (error) {
			console.error("Erreur lors du filtrage IA:", error);
		} finally {
			isLoading.value = false;
		}
	});

	return (
		<div style={{ padding: "2rem" }}>
			<Title text={t("home.title@@Bienvenue sur notre site")} />
			<Title text={t("home.title2@@voyage")} />

			<SearchBox onSearch={handleSearch} isLoading={isLoading.value} />

			{lastQuery.value && (
				<p style={{ marginBottom: "1rem", color: "#666" }}>
					{t("search.resultsFor@@Résultats pour")}:{" "}
					<strong>{lastQuery.value}</strong>
				</p>
			)}

			{isLoading.value ? (
				<p>Chargement des recommandations IA...</p>
			) : (
				filteredMenu.value.length > 0 ? (
						filteredMenu.value.map((item) => {
							const translation = menuTranslationsRef[item.id] as {
								name: string;
								description: string;
							};
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
						})
					) : (
						<p>Aucun plat ne correspond à vos critères.</p>
					)
			)}
		</div>
	);
});
