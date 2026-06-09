import {
	renderToStream,
	type RenderToStreamOptions,
	type RenderOptions,
} from "@builder.io/qwik/server";
import { isDev } from "@builder.io/qwik/build";
import Root from "./root";
import { config } from "./speak-config";

export function extractBase({ serverData }: RenderOptions): string {
	if (!isDev && serverData?.locale) {
		return `/build/${serverData.locale}`;
	} else {
		return "/build";
	}
}

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
