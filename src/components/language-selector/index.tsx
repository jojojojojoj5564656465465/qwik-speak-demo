import { $, component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import {
	inlineTranslate,
	localizePath,
	useSpeakConfig,
	useSpeakLocale,
} from "qwik-speak";
import styles from "./language-selector.module.css";

export const LanguageSelector = component$(() => {
	const t = inlineTranslate();
	const locale = useSpeakLocale();
	const config = useSpeakConfig();
	const url = useLocation().url;
	const currentPath = url.pathname + url.search;

	const handleLanguageChange = $((lang: string) => {
		const getPath = localizePath();
		window.location.href = getPath(currentPath, lang);
	});

	return (
		<nav class={styles.nav} aria-label={t("lang.selector@@Language selector")}>
			{config.supportedLocales.map((loc, i) => (
				<>
					{i > 0 && <span class={styles.separator}>|</span>}
					<a
						key={loc.lang}
						href={localizePath()(currentPath, loc.lang)}
						class={loc.lang === locale.lang ? styles.active : styles.link}
						hreflang={loc.lang}
						onClick$={(e) => {
							e.preventDefault();
							handleLanguageChange(loc.lang);
						}}
					>
						{t(`lang.${loc.lang}@@${loc.lang}`)}
					</a>
				</>
			))}
		</nav>
	);
});
