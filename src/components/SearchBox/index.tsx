import { component$, useSignal, type QRL } from "@builder.io/qwik";
import { inlineTranslate } from "qwik-speak";
import styles from "./main.module.css";

interface SearchBoxProps {
	onSearch: QRL<(query: string) => Promise<void>>;
	isLoading: boolean;
}

export default component$<SearchBoxProps>(({ onSearch, isLoading }) => {
	const t = inlineTranslate();
	const query = useSignal("");

	return (
		<form
			preventdefault:submit
			onSubmit$={() => {
				if (!query.value.trim()) return;
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
	 pensionné={isLoading}
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
