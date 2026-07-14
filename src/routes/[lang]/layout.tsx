import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { inlineTranslate, useSpeakLocale } from "qwik-speak";
import CheckBox from "~/components/CheckBox";
import { LanguageSelector } from "~/components/language-selector";
import { config } from "../../speak-config";
export const onRequest: RequestHandler = async ({ params, redirect }) => {
	if (!config.supportedLocales.find((l) => l.lang === params.lang)) {
		throw redirect(302, `/${config.defaultLocale.lang}/`);
	}
};

export default component$(() => {
	const t = inlineTranslate();
	const locale = useSpeakLocale();
	const homeHref = `/${locale.lang}/`;
	const aboutHref = `/${locale.lang}/about/`;

	return (
		<>
			<nav
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "1rem",
					borderBottom: "1px solid #ccc",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
					<a
						href={homeHref}
						style={{
							fontWeight: "bold",
							textDecoration: "none",
							color: "inherit",
						}}
					>
						{t("app.title@@Bienvenue")}
					</a>
					<a href={aboutHref} style={{ textDecoration: "none", color: "#666" }}>
						{t("app.nav.about@@À propos")}
					</a>
				</div>
				<LanguageSelector />
			</nav>
			<CheckBox/>
			<Slot />
		</>
	);
});
