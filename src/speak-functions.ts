import { server$ } from "@builder.io/qwik-city";
import type { LoadTranslationFn, TranslationFn } from "qwik-speak";

const translationData = import.meta.glob<string>("/public/i18n/**/*.json", {
	query: "?raw",
	import: "default",
	eager: true,
});

const loadTranslation$: LoadTranslationFn = server$(
	(lang: string, asset: string) =>
		JSON.parse(translationData[`/public/i18n/${lang}/${asset}.json`]),
);

export const translationFn: TranslationFn = {
	loadTranslation$: loadTranslation$,
};
