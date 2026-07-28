import { a } from "@arrirpc/schema";
import { $, component$, useContext } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { inlineTranslate, type Translation } from "qwik-speak";
import { AllergiesContext } from "~/contexts/allergies-context";
import type { Allergie } from "~/data/newmenu";

interface AllergieItem {
  id: string;
  value: Allergie;
}

const CheckBoxItemSchema = a.object({
  value: a.string(),
});

const ALLERGIE_ITEMS: readonly AllergieItem[] = [
  { id: "1", value: "gluten" },
  { id: "2", value: "lactose" },
  { id: "3", value: "arachide" },
  { id: "4", value: "fruits à coque" },
  { id: "5", value: "soja" },
  { id: "6", value: "poisson" },
  { id: "7", value: "crustacés" },
  { id: "8", value: "moutarde" },
  { id: "9", value: "sésame" },
  { id: "10", value: "sulfites" },
];

const allergyLabel = server$(
  (
    allergiesTranslations: Translation,
    id: string,
    fallback: Allergie,
  ): string => {
    const result = a.coerce(CheckBoxItemSchema, allergiesTranslations[id]);
    if (!result.success) return fallback;
    return result.value.value || fallback;
  },
);

export default component$(() => {
  const allergiesContext = useContext(AllergiesContext);
  const t = inlineTranslate();

  const handleReset = $(() => {
    allergiesContext.value = [];
  });

  return (
    <div class="mx-auto max-w-md space-y-8 p-6">
      <DietaryForm />
      <button
        type="button"
        onClick$={handleReset}
        class="w-full rounded bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
      >
        {t("checkbox.resetButton@@Effacer les filtres")}
      </button>
    </div>
  );
});

export const DietaryForm = component$(() => {
  const t = inlineTranslate();
  const allergiesContext = useContext(AllergiesContext);
  const allergiesTranslations = t<Translation>("allergies");

  const toggleAllergie = $((value: Allergie, isChecked: boolean) => {
    if (isChecked) {
      if (!allergiesContext.value.includes(value)) {
        allergiesContext.value = [...allergiesContext.value, value];
      }
    } else {
      allergiesContext.value = allergiesContext.value.filter(
        (v) => v !== value,
      );
    }
  });

  return (
    <div>
      <h2 class="mb-4 text-xl font-bold">
        {t("checkbox.title@@Filtrer par allergènes")}
      </h2>
      <div class="space-y-2">
        {ALLERGIE_ITEMS.map((item) => (
          <label
            key={item.id}
            class="flex cursor-pointer items-center space-x-2"
          >
            <input
              type="checkbox"
              value={item.value}
              checked={allergiesContext.value.includes(item.value)}
              onChange$={(_, currentTarget) => {
                toggleAllergie(item.value, currentTarget.checked);
              }}
              class="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>
              {allergyLabel(allergiesTranslations, item.id, item.value)}
            </span>
          </label>
        ))}
      </div>

      <div class="mt-6 rounded bg-gray-100 p-4">
        <p class="font-medium">
          {t("checkbox.excludedTitle@@Éléments exclus de la liste")}
        </p>
        <p class="text-sm text-gray-700">
          {allergiesContext.value.length > 0
            ? allergiesContext.value
                .map((allergy) => {
                  const item = ALLERGIE_ITEMS.find((i) => i.value === allergy);
                  return item
                    ? allergyLabel(allergiesTranslations, item.id, allergy)
                    : allergy;
                })
                .join(", ")
            : t("checkbox.none@@Aucun élément")}
        </p>
      </div>
    </div>
  );
});
