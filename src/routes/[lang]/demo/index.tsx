import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { inlineTranslate } from "qwik-speak";
import Currency from "~/components/currency-converter";
export default component$(() => {
  const t = inlineTranslate();

  return (
    <div style={{ padding: "2rem" }}>
    <Currency />
    </div>
  );
});

export const head: DocumentHead = () => {
  const t = inlineTranslate();
  return {
    title: t("about.head.title@@À propos"),
    meta: [
      {
        name: "description",
        content: t(
          "about.head.description@@Page à propos de notre site multilingue",
        ),
      },
    ],
    links: [
      { rel: "alternate", hreflang: "fr", href: "/fr/about/" },
      { rel: "alternate", hreflang: "en", href: "/en/about/" },
      { rel: "alternate", hreflang: "es", href: "/es/about/" },
      { rel: "alternate", hreflang: "x-default", href: "/fr/about/" },
    ],
  };
};
