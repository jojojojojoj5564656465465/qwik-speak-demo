import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { inlineTranslate } from "qwik-speak";

export default component$(() => {
	const t = inlineTranslate();

	return (
		<div style={{ padding: "2rem" }}>
			<h1>{t("about.title@@À propos")}</h1>
			<p>
				{t(
					"about.description@@Ceci est la page à propos. Un petit texte sans importance.",
				)}
			</p>
		</div>
	);
});

export const head: DocumentHead = () => {
	const t = inlineTranslate();
	return {
		title: t("about.head.title@@À propos"),
		meta: [
			{
				name: "description",
				content: t(
					"about.head.description@@Page à propos de notre site multilingue",
				),
			},
		],
		links: [
			{ rel: "alternate", hreflang: "fr", href: "/fr/about/" },
			{ rel: "alternate", hreflang: "en", href: "/en/about/" },
			{ rel: "alternate", hreflang: "es", href: "/es/about/" },
			{ rel: "alternate", hreflang: "x-default", href: "/fr/about/" },
		],
	};
};
