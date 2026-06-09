import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import {
	inlineTranslate,
	useSpeakConfig,
	useSpeakLocale,
	localizePath,
} from "qwik-speak";
import styles from "./language-selector.module.css";

export const LanguageSelector = component$(() => {
	const t = inlineTranslate();
	const locale = useSpeakLocale();
	const config = useSpeakConfig();
  const url = useLocation().url;
  const currentPath = url.pathname + url.search;
  const getPath = localizePath();

	return (
		<nav class={styles.nav} aria-label={t("lang.selector@@Language selector")}>
			{config.supportedLocales.map((loc, i) => (
				<>
					{i > 0 && <span class={styles.separator}>|</span>}
					<a
						key={loc.lang}
          href={getPath(currentPath, loc.lang)}
						class={loc.lang === locale.lang ? styles.active : styles.link}
						hreflang={loc.lang}
					>
						{t(`lang.${loc.lang}@@${loc.lang}`)}
					</a>
				</>
			))}
		</nav>
	);
});
