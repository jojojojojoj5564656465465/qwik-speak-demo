import { $, component$, useContext } from "@builder.io/qwik";
import { AllergiesContext } from "~/contexts/allergies-context";
import type { Allergie } from "~/data/newmenu";

interface AllergieItem {
	label: string;
	value: Allergie;
}

export default component$(() => {
	const search = useContext(AllergiesContext);

	const handleReset = $(() => {
		search.value = [];
	});

	return (
		<div class="p-6 max-w-md mx-auto space-y-8">
			<DietaryForm />
			<button
				type="button"
				onClick$={handleReset}
				class="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded transition-colors"
			>
				Réinitialiser les préférences
			</button>
		</div>
	);
});

export const DietaryForm = component$(() => {
	const search = useContext(AllergiesContext);

	const items: AllergieItem[] = [
		{ label: "Gluten", value: "gluten" },
		{ label: "Lactose", value: "lactose" },
		{ label: "Arachide", value: "arachide" },
		{ label: "Fruits à coque", value: "fruits à coque" },
		{ label: "Soja", value: "soja" },
		{ label: "Poisson", value: "poisson" },
		{ label: "Crustacés", value: "crustacés" },
		{ label: "Moutarde", value: "moutarde" },
		{ label: "Sésame", value: "sésame" },
		{ label: "Sulfites", value: "sulfites" },
	];

	const toggleAllergie = $((value: Allergie, isChecked: boolean) => {
		if (isChecked) {
			if (!search.value.includes(value)) {
				search.value = [...search.value, value];
			}
		} else {
			search.value = search.value.filter((v) => v !== value);
		}
	});

	return (
		<div>
			<h2 class="text-xl font-bold mb-4">Allergènes à exclure</h2>
			<div class="space-y-2">
				{items.map((item) => (
					<label
						key={item.value}
						class="flex items-center space-x-2 cursor-pointer"
					>
						<input
							type="checkbox"
							value={item.value}
							checked={search.value.includes(item.value)}
							onChange$={(_, currentTarget) => {
								toggleAllergie(item.value, currentTarget.checked);
							}}
							class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
						/>
						<span>{item.label}</span>
					</label>
				))}
			</div>

			<div class="mt-6 p-4 bg-gray-100 rounded">
				<p class="font-medium">Allergènes exclus :</p>
				<p class="text-sm text-gray-700">
					{search.value.length > 0 ? search.value.join(", ") : "Aucun"}
				</p>
			</div>
		</div>
	);
});
