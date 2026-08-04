import { a } from "@arrirpc/schema";
import {
  $,
  component$,
  Resource,
  useContext,
  useResource$,
  useSignal,
  useStore,
} from "@builder.io/qwik";
// server$ : wrapper Qwik qui force l'exécution d'une fonction CÔTÉ SERVEUR.
// Le code wrappé n'est jamais inclus dans le bundle client (sécurité + perfs).
import { type RequestEventBase, server$ } from "@builder.io/qwik-city";
// inlineTranslate (alias `t`) : API principale qwik-speak ; `Translation` est
// un type utilitaire pour typer les valeurs traduites qu'on récupère via t().
import { inlineTranslate, type Translation } from "qwik-speak";
import Button_remove_allergy from "~/components/ButtonClose";
import FoodItem from "~/components/FoodItem";
import SearchBox from "~/components/SearchBox";
import { Title } from "~/components/Title";
import { AllergiesContextStore } from "~/contexts/allergies-context";
import { type Item, menu } from "~/data/newmenu";
import { filterMenuWithAI } from "~/scripts/openIa";
import {
  type Allergie,
  AllergiesArray,
  type AllergiesStore,
} from "~/types/allergies";

// Aplatit { entrees, plats, desserts } en un seul tableau Item[]
// pour la recherche et l'affichage. Les boissons sont exclues volontairement
// car elles ne portent pas d'allergènes dans le modèle de données.
const flatMenu: Item[] = [
  ...(menu.entrees ?? []),
  ...(menu.plats ?? []),
  ...(menu.desserts ?? []),
];
const MenuSchema = a.object({
  nom: a.string(),
  description: a.string(),
});

const serverIa = server$(async function (
  this: RequestEventBase,
  prompt: string,
) {
  const apiKey = this.env.get("NVIDIA_API_KEY");
  const baseURL =
    this.env.get("NVIDIA_BASE_URL") ?? "https://integrate.api.nvidia.com/v1";
  if (!apiKey) {
    console.error("NVIDIA_API_KEY manquante dans l'environnement serveur");
    return [];
  }

  const responseIa = await filterMenuWithAI(prompt, apiKey, baseURL);

  // SÉCURITÉ : Si l'IA ne retourne pas une chaîne, on évite le crash
  if (typeof responseIa !== "string") {
    return [];
  }

  const matchedIds: string[] = responseIa.match(/\b\d+\b/g) ?? [];
  return flatMenu.filter((item) => matchedIds.includes(item.id.toString()));
});

function filterByAllergies(
  items: Item[],
  activeAllergies: readonly Allergie[],
): Item[] {
  if (activeAllergies.length === 0) return items;

  // Logique AND : ne garder que les plats contenant TOUS les allergènes actifs.
  // Un plat sans allergenes (undefined) ne passe jamais le filtre quand des
  // allergènes sont sélectionnés.
  return items.filter((item) => {
    const itemAllergenes = item.allergenes ?? [];
    return activeAllergies.every((a) => itemAllergenes.includes(a));
  });
}

export default component$(() => {
  const t = inlineTranslate();
  const menuTranslations = t<Translation>("menu");
  const _allergiesTranslations = t<Translation>("allergies");

  const search = useStore({ inputBox: "" });

  const allergiesContext: AllergiesStore = useContext(AllergiesContextStore);
  const lastQuery = useSignal<string>("");

  const menuResource = useResource$<Item[]>(async ({ track }) => {
    const query = track(() => lastQuery.value);
    track(allergiesContext);
    const activeAllergies = (
      Object.entries(allergiesContext) as Array<[Allergie, { active: boolean }]>
    )
      .filter(([, entry]) => entry.active)
      .map(([key]) => key);

    let results: Item[];

    if (!query.trim()) {
      // Pas de requête utilisateur → on affiche le menu complet (avant filtre).
      results = flatMenu;
    } else {
      try {
        // Recherche sémantique via l'IA NVIDIA côté serveur.
        results = await serverIa(query);
      } catch (error) {
        console.error("Erreur lors du filtrage IA:", error);
        throw error;
      }
    }

    // Combiner le résultat IA avec le filtre d'allergènes checkBox (logique AND).
    // Seuls les plats contenant TOUS les allergènes actifs sont conservés.
    return filterByAllergies(results, activeAllergies);
  });

  /**
   * handleSearch — appelé par <SearchBox/> (QRL serializable via $()).
   * Met à jour deux états :
   *   - lastQuery (trigger useResource$)
   *   - search.inputBox (affiché dans "Résultats pour <strong>X</strong>")
   */
  const handleSearch = $(async (query: string) => {
    const trimmed = query.trim();
    lastQuery.value = trimmed;
    search.inputBox = trimmed;
  });

  return (
    <div style={{ padding: "2rem" }}>
      <div class="flex flex-wrap gap-x-1 mb-1">
        {AllergiesArray.map((allergie) => (
          <Button_remove_allergy key={allergie} label={allergie} />
        ))}
      </div>
      {/* Titres traduits via qwik-speak. Syntax `@@` : clé i18n || fallback. */}
      <Title text={t("home.title@@Bienvenue sur notre site")} />
     
      <SearchBox onSearch={handleSearch} isLoading={menuResource.loading} />
      {/* Affiché seulement si l'utilisateur a tapé qqch. Évite le bruit au 1er rendu. */}
      {search.inputBox && (
        <p style={{ marginBottom: "1rem", color: "#666" }}>
          {t("search.resultsFor@@Résultats pour")}:{" "}
          <strong>{search.inputBox}</strong>
        </p>
      )}

      {/* Rappel du filtre actif. */}
      {Object.values(allergiesContext).some((entry) => entry.active) && (
        <p
          style={{ marginBottom: "1rem", color: "#c62828", fontSize: "0.9rem" }}
        >
          {t(
            "search.activeAllergiesFilter@@Filtre actif : plats contenant TOUS les allergènes sélectionnés",
          )}{" "}
          :{" "}
          <strong>
            {(
              Object.entries(allergiesContext) as Array<
                [Allergie, { active: boolean }]
              >
            )
              .filter(([, entry]) => entry.active)
              .map(([key]) => _allergiesTranslations[key])
              .join(", ")}
          </strong>
        </p>
      )}
      <Resource
        value={menuResource}
        onPending={() => (
          <p>{t("search.loading@@Chargement des recommandations...")}</p>
        )}
        onRejected={(error) => (
          <p style={{ color: "red" }}>
            {t("search.error@@Une erreur est survenue lors de la recherche :")}{" "}
            {error.message}
          </p>
        )}
        onResolved={(filteredMenu) => {
          if (filteredMenu.length === 0) {
            const hasActiveAllergies = Object.values(allergiesContext).some(
              (e) => e.active,
            );
            return (
              <p>
                {t(
                  hasActiveAllergies
                    ? "search.noResultsWithAllergies@@Aucun plat ne contient TOUS les allergènes sélectionnés."
                    : "search.noResults@@Aucun plat ne correspond à vos critères.",
                )}
              </p>
            );
          }
          const activeAllergies = (
            Object.entries(allergiesContext) as Array<
              [Allergie, { active: boolean }]
            >
          )
            .filter(([, entry]) => entry.active)
            .map(([key]) => key);
          return (
            <>
              {filteredMenu
                .filter(
                  (item) =>
                    !item.allergenes?.some((allergene) =>
                      activeAllergies.includes(allergene),
                    ),
                )
                .map((item) => {
                  const result = a.parse(MenuSchema, menuTranslations[item.id]);

                  const translation = result.success ? result.value : null;

                  return (
                    <FoodItem
                      key={item.id}
                      name={translation?.nom || item.nom}
                      description={translation?.description || item.description}
                      src={item.src}
                      price={item.prix}
                    />
                  );
                })}
            </>
          );
        }}
      />
    </div>
  );
});
