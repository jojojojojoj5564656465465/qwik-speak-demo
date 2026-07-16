import { component$, Slot } from "@builder.io/qwik";
// RequestHandler : type Qwik City pour les middlewares d'endpoint de routing.
// onRequest s'exécute AVANT le rendu du composant — c'est l'endroit idéal pour
// valider les params URL (ici : la locale [lang]) et rediriger si invalide.
import type { RequestHandler } from "@builder.io/qwik-city";
// inlineTranslate : API qwik-speak pour traduire t("clé").
// useSpeakLocale : hook qui retourne la locale ACTIVE résolue (ex: {lang:"fr"}).
// On l'utilise pour construire les URLs: /fr/about, /en/about, /es/about.
import { inlineTranslate, useSpeakLocale } from "qwik-speak";
// CheckBox : le panneau de filtrage par allergènes. Rendu ici dans la layout
// pour qu'il soit présent sur TOUTES les pages [lang]/* (index + about).
import CheckBox from "~/components/CheckBox";
import { LanguageSelector } from "~/components/language-selector";
// config.supportedLocales : la liste canonique des locales acceptées.
// Source de vérité unique — toute nouvelle langue doit être ajoutée ICI ET
// dans public/i18n/<lang>/ (sinon qwik-speak chargera un asset inexistant).
import { config } from "../../speak-config";

/**
 * onRequest — middleware Qwik City de validation de la locale URL.
 *
 * Pourquoi un throw redirect plutôt qu'un simple if/return ?
 * En Qwik City, lancer `redirect(302, "/fr/")` dans un RequestHandler arrête
 * immédiatement l'exécution et envoie un header HTTP 302 au client.
 * C'est la manière idiomatique de gérer les routes inexistantes sans fallback 404.
 *
 * Sans cette garde, /xx/ (locale non supportée) afficherait une page avec
 * aucun fichier i18n → t() retournerait les clés brutes plutôt que des
 * traductions ("app.title" au lieu de "Bienvenue").
 */
export const onRequest: RequestHandler = async ({ params, redirect }) => {
	if (!config.supportedLocales.find((l) => l.lang === params.lang)) {
		// Redirige vers la locale par défaut (fr). 302 = redirect temporaire,
		// les moteurs de recherche ne mettent pas à jour leur索引 (plus safe).
		throw redirect(302, `/${config.defaultLocale.lang}/`);
	}
};

/**
 * <Layout/> — layout partagée entre toutes les routes /<lang>/*.
 *
 * Rendu :
 *   ┌─────────────────────────────────────┐
 *   │ NAV (Accueil · À propos · LangSelector) │   ← liens traduits via t()
 *   ├─────────────────────────────────────┤
 *   │ <CheckBox/>  → panneau filtre allergènes   │   ← MUT AllergiesContext
 *   ├─────────────────────────────────────┤
 *   │ <Slot/>      → page courante (index/about) │   ← consomme le filtre
 *   └─────────────────────────────────────┘
 *
 * Note architecture : <CheckBox/> EST dans la layout (pas dans la page) pour
 * que le filtre reste visible et persistant entre /fr/ → /fr/about. Comme
 * l'état vit dans AllergiesContext (root.tsx), il survit aux navigations.
 */
export default component$(() => {
	const t = inlineTranslate();
	// useSpeakLocale : hook qwik-speak donnant { lang, domain, extension }.
	// Ici on utilise juste .lang pour générer dynamiquement les URLs de nav.
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
					{/* Lien Accueil. t("app.title@@fallback") : si la clé manque
					    dans app.json, le libellé fallback (après @@) est utilisé. */}
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
				{/* LanguageSelector : switch de langue, change le segment [lang] de l'URL */}
				<LanguageSelector />
			</nav>
			{/* Panneau de filtre — partagé sur toutes les pages [lang]/*. */}
			<CheckBox />
			<Slot />
		</>
	);
});
