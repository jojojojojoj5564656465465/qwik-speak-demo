import {
	renderToStream,
	type RenderToStreamOptions,
	type RenderOptions,
} from "@builder.io/qwik/server";
import { isDev } from "@builder.io/qwik/build";
import Root from "./root";
import { config } from "./speak-config";

/**
 * Surcharge du `base` des chunks pour scope-er le build par locale.
 * En production, chaque locale a son propre dossier /build/<locale>/* afin
 * d'isoler les bundles client (chunks de traduction inclus). En dev, on
 * retombe sur /build (Vite sert les modules à la volée, pas de scoping).
 *
 * `serverData.locale` est injecté par Qwik City en fonction du segment [lang]
 * de la route courante ; c'est ce qui permet à l'attribut `lang` du <html> (ci-dessous)
 * d'être dynamique et cohérent avec l'URL.
 */
export function extractBase({ serverData }: RenderOptions): string {
	if (!isDev && serverData?.locale) {
		return `/build/${serverData.locale}`;
	} else {
		return "/build";
	}
}

/**
 * Point d'entrée SSR — produit le HTML streamé envoyé au navigateur.
 *
 * - containerAttributes.lang : la balise <html lang="..."> reflète la locale
 *   courante (utilisé par qwik-speak ET les lecteurs d'écran — impact SEO/a11y).
 * - defaultLocale (= "fr") est utilisé si la locale n'est pas résolue par Qwik City.
 */
export default function (opts: RenderToStreamOptions) {
	return renderToStream(<Root />, {
		base: extractBase,
		...opts,
		containerAttributes: {
			lang: opts.serverData?.locale || config.defaultLocale.lang,
			...opts.containerAttributes,
		},
		serverData: {
			...opts.serverData,
		},
	});
}
