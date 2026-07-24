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
		<div class="p-6 max-w-md mx-auto space-y-8">
			<DietaryForm />
			<button
				type="button"
				onClick$={handleReset}
				class="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded transition-colors"
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
			<h2 class="text-xl font-bold mb-4">
				{t("checkbox.title@@Filtrer par allergènes")}
			</h2>
			<div class="space-y-2">
				{ALLERGIE_ITEMS.map((item) => (
					<label
						key={item.id}
						class="flex items-center space-x-2 cursor-pointer"
					>
						<input
							type="checkbox"
							value={item.value}
							checked={allergiesContext.value.includes(item.value)}
							onChange$={(_, currentTarget) => {
								toggleAllergie(item.value, currentTarget.checked);
							}}
							class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
						/>
						<span>
							{allergyLabel(allergiesTranslations, item.id, item.value)}
						</span>
					</label>
				))}
			</div>

			<div class="mt-6 p-4 bg-gray-100 rounded">
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
