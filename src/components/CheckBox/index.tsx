import { $, component$,  useContext } from "@builder.io/qwik";
import { inlineTranslate, type Translation } from "qwik-speak";

import { AllergiesContextStore } from "~/contexts/allergies-context";
import type { Allergie } from "~/types/allergies";

const setAllActive = $(
	<T extends Record<string, { active: boolean }>>(
		obj: T,
		state: boolean,
	): T => {
		for (const key in obj) {
			obj[key].active = state;
		}
		return obj;
	},
);

export default component$(() => {
	const allergiesSig = useContext(AllergiesContextStore);
	const t = inlineTranslate();

	const handleReset = $(() => {
		setAllActive(allergiesSig, false);
	});
	const handleSelectAll = $(() => {
		setAllActive(allergiesSig, true);
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
			<button
				type="button"
				onClick$={handleSelectAll}
				class="w-full rounded bg-green-500 px-4 py-2 font-medium text-white transition-colors hover:bg-green-600"
			>
				{t("checkbox.selectAllButton@@Tout sélectionner")}
			</button>
		</div>
	);
});

const DietaryForm = component$(() => {
	const t = inlineTranslate();
	const allergiesStor = useContext(AllergiesContextStore);
	const allergiesTranslations = t<Translation>("allergies");

	// `allergiesTranslations` est typé `Translation` (Record<string, any>).
	// Les clés d'`allergies.json` sont les valeurs littérales de l'union `Allergie`,
	// et les valeurs sont désormais des chaînes directes (ex: { "gluten": "Gluten" }).
	const isAllergieKey = $((key: string): key is Allergie =>
		Object.hasOwn(allergiesStor, key),
	);

	const ALLERGIE_ITEMS_WITH_LABEL = (
		Object.entries(allergiesStor) as Array<[string, { active: boolean }]>
	)
		.map(([keyAllergies, allergenEntry]) => {
			if (!isAllergieKey(keyAllergies)) return null;
			const label =
				(typeof allergiesTranslations[keyAllergies] === "string"
					? (allergiesTranslations[keyAllergies] as string)
					: "") || `Traduction manquante pour ${keyAllergies}`;
			return {
				id: keyAllergies,
				value: keyAllergies,
				label,
				active: allergenEntry.active,
			};
		})
		.filter((item): item is NonNullable<typeof item> => item !== null);





	const toggleAllergie = $((value: Allergie, isChecked: boolean) => {
		allergiesStor[value].active = isChecked;
	});



	return (
		<div>
			<h2 class="mb-4 text-xl font-bold">
				{t("checkbox.title@@Filtrer par allergènes")}
			</h2>
			<div class="space-y-2">
				{ALLERGIE_ITEMS_WITH_LABEL.map((item) => (
					<label
						key={`checkbox-${item.id}`}
						class="flex cursor-pointer items-center space-x-2"
					>
						<input
							type="checkbox"
							value={item.value}
							checked={item.active}
							onChange$={(_, currentTarget) => {
								toggleAllergie(item.value as Allergie, currentTarget.checked);
							}}
							class="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
						/>
						<span>{item.label}</span>
					</label>
				))}
			</div>

		
		</div>
	);
});
