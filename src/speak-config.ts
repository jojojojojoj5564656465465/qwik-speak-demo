import type { SpeakConfig } from "qwik-speak";

export const config: SpeakConfig = {
  defaultLocale: { lang: "fr" },
  supportedLocales: [{ lang: "fr" }, { lang: "en" }, { lang: "es" }],
  assets: ["app", "home", "about", "menu"],
  runtimeAssets: ["runtime"],
};
