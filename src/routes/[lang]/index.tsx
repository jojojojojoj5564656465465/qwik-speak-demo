import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { inlineTranslate } from "qwik-speak";
import FoodItem from "~/components/FoodItem"; // Import du composant FoodItem
import { Title } from "~/components/Title";

export default component$(() => {
	const t = inlineTranslate();

	return (
		<div style={{ padding: "2rem" }}>
			<Title text={t("home.title@@Bienvenue sur notre site")} />
			<Title text={t("home.title2@@voyage")} />
			<FoodItem
				name={t("Pâtes à la carbonara")}
				description={t(
					"Un plat italien classique avec des pâtes, du bacon, des œufs et du fromage.",
				)}
				src="/pizza.jpg"
				price={45000}
			/>
			<h2>{t("home.subtitle@@Créé avec Qwik et Qwik-Speak")}</h2>
			<p>
				{t(
					"home.description@@Ceci est une page multilingue. Utilisez le menu pour changer de langue.",
				)}
			</p>
		</div>
	);
});

export const head: DocumentHead = () => {
	const t = inlineTranslate();
	return {
		title: t("home.head.title@@Bienvenue"),
		meta: [
			{
				name: "description",
				content: t("home.head.description@@Site multilingue avec Qwik"),
			},
		],
		links: [
			{ rel: "alternate", hreflang: "fr", href: "/fr/" },
			{ rel: "alternate", hreflang: "en", href: "/en/" },
			{ rel: "alternate", hreflang: "es", href: "/es/" },
			{ rel: "alternate", hreflang: "x-default", href: "/fr/" },
		],
	};
};
