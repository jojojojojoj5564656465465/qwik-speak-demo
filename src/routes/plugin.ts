import type { RequestHandler } from "@builder.io/qwik-city";
import { setSpeakContext, validateLocale } from "qwik-speak";
import { config } from "../speak-config";

export const onRequest: RequestHandler = ({ params, locale, request }) => {
	let lang: string | undefined;

	if (params.lang && validateLocale(params.lang)) {
		lang = config.supportedLocales.find((l) => l.lang === params.lang)?.lang;
	}

	if (!lang) {
		const accept = request.headers.get("accept-language");
		if (accept) {
			const preferred = accept.split(";")[0]?.split(",")[0]?.trim();
			lang = config.supportedLocales.find((l) => l.lang === preferred)?.lang;
		}
	}

	if (!lang) {
		lang = config.defaultLocale.lang;
	}

	setSpeakContext(config);
	locale(lang);
};
