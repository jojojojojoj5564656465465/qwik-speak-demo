import { component$, type QRL, useSignal, useTask$ } from "@builder.io/qwik";
import { inlineTranslate } from "qwik-speak";
import styles from "./main.module.css";

interface SearchBoxProps {
	// Événement déclenché lorsque la recherche change (soumission ou debounce)
	onSearch: QRL<(query: string) => void>;
	isLoading: boolean;
}


export default component$<SearchBoxProps>(({ onSearch, isLoading }) => {
	const t = inlineTranslate();
	const query = useSignal("");

	// Optionnel mais fortement recommandé : Un Debounce en temps réel avec useTask$
	// Si l'utilisateur tape, on attend 500ms d'inactivité avant de lancer la recherche IA automatiquement.
	useTask$(({ track, cleanup }) => {
		const value = track(() => query.value);

		// Si la barre est vidée, on réinitialise immédiatement le menu complet
		if (value.trim() === "") {
			onSearch("");
			return;
		}

		// Délai de 500ms pour éviter de surcharger l'API NVIDIA/OpenAI à chaque lettre
		const id = setTimeout(() => {
			onSearch(value.trim());
		}, 3500);

		// Nettoyage si l'utilisateur re-tape une lettre avant la fin des 500ms
		cleanup(() => clearTimeout(id));
	});

	return (
		<form
			preventdefault:submit
			onSubmit$={() => {
				// Permet aussi de forcer la validation immédiate au clic ou sur la touche Entrée
				onSearch(query.value.trim());
			}}
			class={styles.searchForm}
		>
			<div class={styles.searchInputWrapper}>
				<input
					type="text"
					value={query.value}
					onInput$={(e) => {
						query.value = (e.target as HTMLInputElement).value;
					}}
					placeholder={t("search.placeholder@@Décrivez vos envies...")}
					class={styles.searchInput}
					disabled={isLoading}
				/>
				<button
					type="submit"
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
