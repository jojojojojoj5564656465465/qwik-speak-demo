import { component$, type QRL, useSignal, useTask$ } from "@builder.io/qwik";
// inlineTranslate : alias `t()` à l'intérieur d'une expression JSX, sans la
// déclarer en variable intermédiaire (alternative à `const t = useTranslate()`).
// Pratique pour les petits composants ; pour les gros, useTranslate est plus lisible.
import { inlineTranslate } from "qwik-speak";
import styles from "./main.module.css";

interface SearchBoxProps {
	// QRL<(arg)=>void> : un pointeur de fonction SERIALIZABLE (Qwik lazy-load).
	// Permet de passer onSearch en prop sans charger le code de la fonction
	// tant que l'utilisateur ne soumet pas le formulaire (Resumability).
	onSearch: QRL<(query: string) => void>;
	isLoading: boolean;
}

/**
 * <SearchBox/> — champ de recherche textuelle avec debounce.
 *
 * Architecture réactive :
 *   user input --> query.value (signal local)
 *      └──── useTask$ (track query) --> 3500ms debounce --> onSearch(query)
 *                                                   ↓
 *                    [lang]/index.tsx.handleSearch --> lastQuery.value
 *                                                   ↓
 *                    useResource$ (track lastQuery) --> serverIa() + filtre
 *
 * Pourquoi useTask$ plutôt qu'un useEffect-like ?
 * useTask$ est le mécanisme Qwik pour les effets SYNCHRONES avec tracking
 * explicite. Le `cleanup` sert à annuler le setTimeout précédent à chaque
 * frappe (anti-rebond), exactement comme useEffect cleanup en React.
 */
export default component$<SearchBoxProps>(({ onSearch, isLoading }) => {
	const t = inlineTranslate();
	// Signal local de la valeur tapée. Réactif : re-render du input à chaque frappe.
	const query = useSignal("");

	// useTask$ : réagit à `query` avec tracking automatique.
	// Pattern : debounce → on n'appelle onSearch QUE quand l'utilisateur
	// arrête de taper pendant 3500 ms (anticipation de la latence NVIDIA API).
	// CORRECTION : le commentaire original disait "500ms" alors que le délai
	// réel est de 3500 ms. Misen à jour ici pour cohérence.
	useTask$(({ track, cleanup }) => {
		// track() déclare la dépendance : useTask$ re-tourne uniquement quand
		// query.value change. Ne PAS oublier le track ou la tâche ne se relance jamais.
		const value = track(() => query.value);

		// Cas premiere : barre vidée → on réinitialise immédiatement (menu complet).
		// Pas de debounce dans ce cas pour un ressenti plus réactif.
		if (value.trim() === "") {
			onSearch("");
			return;
		}

		// Délai anti-rebond de 3500 ms avant d'appeler le endpoint IA.
		// Chaque frappe annule le précédent timeout via cleanup.
		// NOTE : 3500 ms est élevé (typo corrigée dans le commentaire ci-dessus).
		// Si jamais vous souhaitez le passer à 500 ms comme le commentaire original
		// le laissait entendre, remplacez par 500.
		const id = setTimeout(() => {
			onSearch(value.trim());
		}, 3500);

		// cleanup() est appelé AVANT la prochaine exécution de useTask$ et au unmount.
		// Sans clearTimeout, plusieurs requêtes s'empileraient et onSearch se
		// déclencherait plusieurs fois après la dernière frappe.
		cleanup(() => clearTimeout(id));
	});

	return (
		<form
			// preventdefault:submit bloque la navigationбраузера vers ?query=...
			// onSubmit$ : alternative pour soumettre sans attendre le debounce
			// (utile pour l'utilisateur pressé → Entrée immédiate).
			preventdefault:submit
			onSubmit$={() => {
				onSearch(query.value.trim());
			}}
			class={styles.searchForm}
		>
			<div class={styles.searchInputWrapper}>
				<input
					type="text"
					value={query.value}
					// onInput$ met à jour le signal. Cast `as HTMLInputElement`
					// nécessaire car e.target est génériquement EventTarget.
					onInput$={(e) => {
						query.value = (e.target as HTMLInputElement).value;
					}}
					// t("search.placeholder@@<fallback>") : qwik-speak syntax.
					// `@@` sépare la clé i18n de sa valeur par défaut (fallback).
					// Au runtime, qwik-speak cherche "search.placeholder" dans
					// public/i18n/<lang>/search.json ; si absent, utilise "Décrivez..."
					placeholder={t("search.placeholder@@Décrivez vos envies...")}
					class={styles.searchInput}
					disabled={isLoading}
				/>
				<button
					type="submit"
					// Désactivé pendant le chargement IA et si l'input est vide.
					// `!query.value.trim()` est important pour ne pas soumettre "   ".
					disabled={isLoading || !query.value.trim()}
					class={styles.searchButton}
				>
					{isLoading
						? t("search.loading@@Recherche...")
						: t("search.submit@@Trouver mon plat")}
				</button>
			</div>
		</form>
	);
});
