import {
	$,
	component$,
	createContextId,
	type Signal,
	useComputed$,
	useContext,
	useContextProvider,
	useSignal,
	useTask$,
} from "@builder.io/qwik";

interface Item {
	label: string;
}

// 1. CRÉATION DU CONTEXTE
export const DietaryPreferencesContext = createContextId<Signal<string[]>>(
	"dietary-preferences-context",
);

// --- COMPOSANT PARENT ---
export default component$(() => {
	const selectedLabels = useSignal<string[]>([]);

	// Charger les préférences depuis localStorage au montage
	useTask$(() => {
		const saved = localStorage.getItem("dietary-preferences");
		if (saved) {
			try {
				selectedLabels.value = JSON.parse(saved);
			} catch {
				// En cas d'erreur de parsing, ignorer
			}
		}
	});

	// Sauvegarder automatiquement quand le signal change
	useTask$(({ track }) => {
		track(() => selectedLabels.value);
		localStorage.setItem(
			"dietary-preferences",
			JSON.stringify(selectedLabels.value),
		);
	});

	useContextProvider(DietaryPreferencesContext, selectedLabels);

	const handleReset = $(() => {
		selectedLabels.value = [];
		localStorage.removeItem("dietary-preferences");
	});

	return (
		<div class="p-6 max-w-md mx-auto space-y-8">
			<DietaryForm />
			<DishChecker />

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

// --- COMPOSANT ENFANT 1 : Le formulaire de sélection ---
export const DietaryForm = component$(() => {
	const selectedLabels = useContext(DietaryPreferencesContext);

	const items: Item[] = [
		{ label: "Végétarien" },
		{ label: "Sans porc" },
		{ label: "Sans lactose" },
		{ label: "Sans crustacés" },
		{ label: "Sans lait ni dérivés" },
		{ label: "Sans œufs" },
		{ label: "Sans arachides ni fruits à coque" },
		{ label: "Sans fruits de mer" },
		{ label: "Sans gluten" },
		{ label: "Sans soja, sésame ni lupin" },
	];

	// CORRECTION : toggleLabel doit être un QRL
	const toggleLabel = $((label: string, isChecked: boolean) => {
		if (isChecked) {
			if (!selectedLabels.value.includes(label)) {
				selectedLabels.value = [...selectedLabels.value, label];
			}
		} else {
			selectedLabels.value = selectedLabels.value.filter((l) => l !== label);
		}
	});

	return (
		<div>
			<h2 class="text-xl font-bold mb-4">Interdits Alimentaires</h2>
			<div class="space-y-2">
				{items.map((item) => (
					<label
						key={item.label}
						class="flex items-center space-x-2 cursor-pointer"
					>
						<input
							type="checkbox"
							value={item.label}
							checked={selectedLabels.value.includes(item.label)}
							onChange$={(_, currentTarget) => {
								toggleLabel(item.label, currentTarget.checked);
							}}
							class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
						/>
						<span>{item.label}</span>
					</label>
				))}
			</div>

			<div class="mt-6 p-4 bg-gray-100 rounded">
				<p class="font-medium">Interdits sélectionnés :</p>
				<p class="text-sm text-gray-700">
					{selectedLabels.value.length > 0
						? selectedLabels.value.join(", ")
						: "Aucun"}
				</p>
			</div>
		</div>
	);
});

// --- COMPOSANT ENFANT 2 : La vérification du plat ---
export const DishChecker = component$(() => {
	const selectedLabels = useContext(DietaryPreferencesContext);

	const epinardCremeAllowedLabels = new Set<string>([
		"Végétarien",
		"Sans porc",
		"Sans crustacés",
		"Sans lait ni dérivés",
		"Sans œufs",
		"Sans arachides ni fruits à coque",
		"Sans fruits de mer",
		"Sans gluten",
		"Sans soja, sésame ni lupin",
	]);

	const isCompatibleWithEpinard = useComputed$(() => {
		if (selectedLabels.value.length === 0) return true;

		return selectedLabels.value.every((label) =>
			epinardCremeAllowedLabels.has(label),
		);
	});

	return (
		<div
			class={`p-4 rounded ${
				isCompatibleWithEpinard.value ? "bg-green-100" : "bg-red-100"
			}`}
		>
			<p class="font-medium">Plat épinard crème :</p>
			<p class="text-sm font-bold">
				{isCompatibleWithEpinard.value
					? "✅ Compatible avec vos critères"
					: "❌ Non compatible (contient un ingrédient interdit)"}
			</p>
		</div>
	);
});
